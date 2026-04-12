import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { getNodeColor, getGlowColor, HUB_ID } from '../utils/graphDataUtils';

const BG = '#0a0a0a';
const trunc = (s, n = 22) => s.length > n ? s.slice(0, n - 1) + '…' : s;

/* ─── random stars generated once ────────────────────────────────── */
const STARS = Array.from({ length: 220 }, () => ({
    x: Math.random() * 3840,   // larger than any screen
    y: Math.random() * 2160,
    r: Math.random() * 0.75 + 0.15,
    a: Math.random() * 0.28 + 0.04,
}));

export default function KnowledgeGraph({ data }) {
    const fgRef = useRef(null);
    const [hovered, setHovered] = useState(null);
    const [dims, setDims] = useState({ w: 800, h: 600 });

    /* ── Responsive ─────────────────────────────────────────────── */
    useEffect(() => {
        const upd = () => setDims({ w: window.innerWidth, h: window.innerHeight - 64 });
        upd();
        window.addEventListener('resize', upd);
        return () => window.removeEventListener('resize', upd);
    }, []);

    /* ── Initial seeded positions ───────────────────────────────── */
    const graphData = useMemo(() => {
        if (!data?.nodes?.length) return { nodes: [], links: [] };

        const cx = dims.w / 2, cy = dims.h / 2;
        const byLevel = {};
        data.nodes.forEach(n => (byLevel[n.level] = byLevel[n.level] || []).push(n));

        // Compact radii — physics will spread them out organically
        const RADII = { '-1': 0, 0: 110, 1: 230, 2: 350, 3: 460 };

        const nodes = data.nodes.map(node => {
            if (node.type === 'hub') return { ...node, x: cx, y: cy };
            const peers = byLevel[node.level] || [];
            const idx   = peers.indexOf(node);
            const r     = RADII[node.level] ?? 460;
            const angle = (2 * Math.PI * idx) / peers.length;
            // small random jitter so physics can find its own equilibrium
            const jx = (Math.random() - 0.5) * 30;
            const jy = (Math.random() - 0.5) * 30;
            return { ...node, x: cx + r * Math.cos(angle) + jx, y: cy + r * Math.sin(angle) + jy };
        });

        return { nodes, links: [...data.links] };
    }, [data, dims]);

    /* ── Physics ────────────────────────────────────────────────── */
    useEffect(() => {
        if (!fgRef.current || !graphData.nodes.length) return;
        const fg = fgRef.current;

        // Hub pinned at canvas center
        const hub = graphData.nodes.find(n => n.type === 'hub');
        if (hub) { hub.fx = dims.w / 2; hub.fy = dims.h / 2; }

        // Per-type repulsion
        fg.d3Force('charge')?.strength(n => ({
            hub: 0, career: -260, year: -75, subject: -38, note: -10
        }[n.type] ?? -10)).distanceMax(550);

        // Per-link distances — tighter = tighter clusters
        fg.d3Force('link')
            ?.distance(link => {
                const s = typeof link.source === 'object'
                    ? link.source
                    : graphData.nodes.find(n => n.id === link.source);
                return ({ hub: 140, career: 85, year: 55 }[s?.type] ?? 32);
            })
            .strength(0.42);

        // Weak centering gravity so clusters don't fly off-screen
        fg.d3Force('center')?.strength(0.045);

        // Gradually cool the simulation after initial settle
        const t1 = setTimeout(() => {
            fg.d3Force('charge')?.strength(n => ({
                hub: 0, career: -110, year: -35, subject: -20, note: -6
            }[n.type] ?? -6));
        }, 3000);
        const t2 = setTimeout(() => { fg.d3AlphaTarget(0); }, 5500);

        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [graphData, dims]);

    /* ── Neighbor map ───────────────────────────────────────────── */
    const neighborMap = useMemo(() => {
        const map = new Map();
        data?.links?.forEach(link => {
            const s = typeof link.source === 'object' ? link.source.id : link.source;
            const t = typeof link.target === 'object' ? link.target.id : link.target;
            if (!map.has(s)) map.set(s, new Set());
            if (!map.has(t)) map.set(t, new Set());
            map.get(s).add(t); map.get(t).add(s);
        });
        return map;
    }, [data?.links]);

    /* ══ STARFIELD + VIGNETTE (screen space) ══════════════════════ */
    const onRenderFramePre = useCallback((ctx) => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset to screen space

        // Faint stars — fixed regardless of pan/zoom
        STARS.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x % dims.w, s.y % dims.h, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${s.a})`;
            ctx.fill();
        });

        ctx.restore();
    }, [dims]);

    const onRenderFramePost = useCallback((ctx) => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Vignette — darkens edges, pulls focus to center
        const vg = ctx.createRadialGradient(
            dims.w / 2, dims.h / 2, dims.h * 0.28,
            dims.w / 2, dims.h / 2, dims.h * 0.82
        );
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(0,0,0,0.52)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, dims.w, dims.h);

        ctx.restore();
    }, [dims]);

    /* ══ PAINT NODE ════════════════════════════════════════════════ */
    const paintNode = useCallback((node, ctx, gs) => {
        if (!isFinite(node.x) || !isFinite(node.y)) return;

        const isHub      = node.type === 'hub';
        const r          = node.size || 2;
        const color      = getNodeColor(node.type);
        const glowColor  = getGlowColor(node.type);
        const isHov      = hovered?.id === node.id;
        const isNeighbor = hovered && neighborMap.get(hovered.id)?.has(node.id);
        const dim        = hovered && !isHov && !isNeighbor;
        const alpha      = dim ? 0.055 : 1;

        ctx.save();
        ctx.globalAlpha = alpha;

        /* ─── HUB ─────────────────────────────────────────────── */
        if (isHub) {
            const t = Date.now() / 1000;
            const pulse = 0.5 + 0.5 * Math.sin(t * 1.4); // 0→1 oscillation

            // 12 thin radiating rays
            for (let i = 0; i < 12; i++) {
                const ang = (i / 12) * Math.PI * 2;
                const len = r * 2.8 + pulse * r * 0.6;
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(node.x + len * Math.cos(ang), node.y + len * Math.sin(ang));
                ctx.strokeStyle = `rgba(255,255,255,${0.06 + pulse * 0.04})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            // Concentric rings (outermost → innermost)
            [4, 3, 2, 1].forEach(i => {
                const ringR = r + i * 11 + pulse * 3;
                ctx.beginPath();
                ctx.arc(node.x, node.y, ringR, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255,255,255,${(0.04 + pulse * 0.025) * i * 0.6})`;
                ctx.lineWidth = 0.7;
                ctx.stroke();
            });

            // Outer glow
            ctx.shadowColor = `rgba(255,255,255,${0.7 + pulse * 0.3})`;
            ctx.shadowBlur  = 28 + pulse * 10;

            // White core with subtle blue shimmer
            const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.55, `rgba(224,242,254,${0.9 + pulse * 0.1})`);
            grad.addColorStop(1, '#93c5fd');
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.shadowBlur = 0;

            // "APUNTES UDA" label — below, always visible
            const fs = Math.max(9.5 / gs, 3.5);
            ctx.font         = `700 ${fs}px Inter, system-ui, sans-serif`;
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'top';
            // shadow pass
            ctx.fillStyle = 'rgba(0,0,0,0.95)';
            ctx.fillText('APUNTES UDA', node.x + 0.6, node.y + r + 5.6);
            // text pass
            ctx.fillStyle = '#e2e8f0';
            ctx.fillText('APUNTES UDA', node.x, node.y + r + 5);

            ctx.restore();
            return;
        }

        /* ─── Career ──────────────────────────────────────────── */
        if (node.type === 'career') {
            // Outer glow ring
            ctx.beginPath();
            ctx.arc(node.x, node.y, r + 4, 0, Math.PI * 2);
            ctx.strokeStyle = isHov
                ? 'rgba(74,222,128,0.55)'
                : 'rgba(74,222,128,0.18)';
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Glow
            ctx.shadowColor = glowColor;
            ctx.shadowBlur  = isHov ? 24 : 14;

            // Gradient fill
            const g = ctx.createRadialGradient(
                node.x - r * 0.3, node.y - r * 0.3, 0,
                node.x, node.y, r
            );
            g.addColorStop(0, isHov ? '#ffffff' : '#86efac');
            g.addColorStop(1, isHov ? '#4ade80' : '#15803d');
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        /* ─── Year ────────────────────────────────────────────── */
        else if (node.type === 'year') {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur  = isHov ? 18 : 9;

            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            ctx.fillStyle = isHov ? '#fde68a' : color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        /* ─── Subject ─────────────────────────────────────────── */
        else if (node.type === 'subject') {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur  = isHov ? 14 : 6;

            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            ctx.fillStyle = isHov ? '#ddd6fe' : color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        /* ─── Note ────────────────────────────────────────────── */
        else {
            ctx.shadowColor = isNeighbor ? 'rgba(96,165,250,0.6)' : 'none';
            ctx.shadowBlur  = isNeighbor ? 6 : 0;

            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            ctx.fillStyle = isHov
                ? '#60a5fa'
                : isNeighbor
                    ? 'rgba(96,165,250,0.55)'
                    : 'rgba(30,58,95,0.65)';
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();

        /* ─── Labels ─────────────────────────────────────────── */
        const showLabel =
            !dim && (
                isHov
                || node.type === 'career'
                || (node.type === 'year'    && gs > 0.38)
                || (node.type === 'subject' && gs > 0.78)
                || (node.type === 'note'    && gs > 1.5)
            );

        if (!showLabel) return;

        ctx.save();
        ctx.globalAlpha = alpha * 0.93;

        const fsMap = { career: 9.5, year: 8.5, subject: 7.5, note: 7 };
        const fs = Math.max((fsMap[node.type] ?? 7.5) / gs, 2);
        const fw = node.type === 'career' ? '600' : '400';
        ctx.font = `${fw} ${fs}px Inter, system-ui, sans-serif`;
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';

        const label = trunc(node.name, node.type === 'note' ? 18 : 24);
        const lx = node.x + r + 3.5;
        const ly = node.y;

        // Shadow for readability
        ctx.fillStyle = 'rgba(0,0,0,0.92)';
        ctx.fillText(label, lx + 0.5, ly + 0.5);

        const labelColors = {
            career:  '#4ade80',
            year:    '#fbbf24',
            subject: '#c4b5fd',
            note:    '#4b6a8a',
        };
        ctx.fillStyle = isHov ? '#ffffff' : (labelColors[node.type] || '#e2e8f0');
        ctx.fillText(label, lx, ly);

        ctx.restore();
    }, [hovered, neighborMap]);

    /* ══ PAINT LINK ════════════════════════════════════════════════ */
    const paintLink = useCallback((link, ctx) => {
        const src = link.source, tgt = link.target;
        if (!isFinite(src?.x) || !isFinite(tgt?.x)) return;

        const fromHub  = src.id === HUB_ID || src.type === 'hub';
        const active   = hovered && (src.id === hovered.id || tgt.id === hovered.id);
        const dimLink  = hovered && !active;

        ctx.save();

        if (dimLink) {
            ctx.globalAlpha = 0.012;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth   = 0.25;
        } else if (active) {
            const c = getNodeColor(hovered.type === 'hub' ? tgt.type : src.type);
            ctx.globalAlpha = 0.88;
            ctx.strokeStyle = c;
            ctx.shadowColor = c;
            ctx.shadowBlur  = 6;
            ctx.lineWidth   = 1.3;
        } else if (fromHub) {
            ctx.globalAlpha = 0.14;
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth   = 0.4;
        } else {
            const opacity = src.type === 'year' ? 0.13 : (src.type === 'subject' ? 0.1 : 0.08);
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth   = 0.25;
        }

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.stroke();
        ctx.restore();
    }, [hovered]);

    /* ── Events ─────────────────────────────────────────────────── */
    const onHover = useCallback(node => {
        setHovered(node);
        document.body.style.cursor = node ? 'pointer' : 'default';
    }, []);

    const onClick = useCallback(node => {
        if (node.type === 'note' && node.url)
            window.open(node.url, '_blank', 'noopener,noreferrer');
    }, []);

    /* ── Empty state ─────────────────────────────────────────────── */
    if (!data?.nodes?.length) {
        return (
            <div className="graph-container graph-empty" style={{ background: BG }}>
                <div className="graph-empty-message">
                    <div className="graph-spinner"
                        style={{ borderColor: 'rgba(74,222,128,0.12)', borderTopColor: '#4ade80' }} />
                    <h3 className="text-base font-medium mt-4" style={{ color: '#374151' }}>
                        Cargando grafo...
                    </h3>
                </div>
            </div>
        );
    }

    /* ── Render ──────────────────────────────────────────────────── */
    return (
        <div className="graph-container" style={{ background: BG }}>
            <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                width={dims.w}
                height={dims.h}
                backgroundColor={BG}
                nodeCanvasObject={paintNode}
                nodePointerAreaPaint={(node, color, ctx) => {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, (node.size || 2) + 14, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                }}
                linkCanvasObject={paintLink}
                onRenderFramePre={onRenderFramePre}
                onRenderFramePost={onRenderFramePost}
                onNodeHover={onHover}
                onNodeClick={onClick}
                onNodeDrag={n    => { n.fx = n.x; n.fy = n.y; }}
                onNodeDragEnd={n => { n.fx = n.x; n.fy = n.y; }}
                enableZoomInteraction
                enablePanInteraction
                enableNodeDrag
                autoPauseRedraw={false}
                minZoom={0.05}
                maxZoom={14}
                cooldownTicks={220}
                warmupTicks={100}
                d3AlphaDecay={0.006}
                d3VelocityDecay={0.22}
            />

            {/* ── Legend ─────────────────────────────────────────── */}
            <div
                className="graph-legend"
                style={{
                    background: 'rgba(10,10,10,0.88)',
                    borderColor: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <div className="legend-title"
                    style={{ color: '#6b7280', borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                    Estructura de apuntes
                </div>
                {[
                    { color: '#ffffff', shadow: 'rgba(255,255,255,0.8)', label: 'Hub central' },
                    { color: '#4ade80', shadow: 'rgba(74,222,128,0.6)',  label: 'Carrera' },
                    { color: '#fbbf24', shadow: 'rgba(251,191,36,0.5)',  label: 'Año' },
                    { color: '#a78bfa', shadow: 'rgba(167,139,250,0.4)', label: 'Materia' },
                    { color: '#1e3a5f', shadow: 'none',                  label: 'Apunte', border: '#2d5480' },
                ].map(({ color, shadow, label, border }) => (
                    <div className="legend-item" key={label}>
                        <span className="legend-dot" style={{
                            backgroundColor: color,
                            boxShadow: shadow !== 'none' ? `0 0 6px ${shadow}` : undefined,
                            border: border ? `1px solid ${border}` : undefined,
                        }} />
                        <span style={{ color: '#4b5563' }}>{label}</span>
                    </div>
                ))}
                <div className="legend-hint"
                    style={{ color: '#374151', borderTopColor: 'rgba(255,255,255,0.04)' }}>
                    Arrastrá nodos · Click para abrir apunte
                </div>
            </div>

            {/* ── Stats ──────────────────────────────────────────── */}
            <div className="graph-stats" style={{
                background: 'rgba(10,10,10,0.8)',
                border: '1px solid rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
                color: '#374151',
            }}>
                <span>{data.nodes.length} nodos</span>
                <span className="mx-2" style={{ color: '#1c2c3a' }}>•</span>
                <span>{data.links.length} enlaces</span>
            </div>

            {/* ── Hover card ─────────────────────────────────────── */}
            {hovered && hovered.type !== 'hub' && (
                <div className="graph-node-info" style={{
                    background: 'rgba(10,10,10,0.92)',
                    borderColor: `${getNodeColor(hovered.type)}33`,
                    backdropFilter: 'blur(12px)',
                    boxShadow: `0 0 20px ${getNodeColor(hovered.type)}18`,
                }}>
                    <div className="node-info-type" style={{ color: getNodeColor(hovered.type) }}>
                        {hovered.type.toUpperCase()}
                    </div>
                    <div className="node-info-name" style={{ color: '#f1f5f9' }}>
                        {hovered.name}
                    </div>
                    {hovered.type === 'note' && (
                        <div className="node-info-hint" style={{ color: '#374151' }}>
                            Click para abrir
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
