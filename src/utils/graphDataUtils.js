/**
 * Transform flat R2 file paths into graph data (Obsidian Knowledge Graph)
 */

export const HUB_ID = 'hub:apuntes-uda';

/** Obsidian-inspired palette */
export const NODE_COLORS = {
    hub:     '#ffffff',
    career:  '#4ade80',   // green-400
    year:    '#fbbf24',   // amber-400
    subject: '#a78bfa',   // violet-400
    note:    '#1e3a5f',   // dark navy-blue (subtle dots)
};

export const GLOW_COLORS = {
    hub:     'rgba(255,255,255,0.95)',
    career:  'rgba(74,222,128,0.75)',
    year:    'rgba(251,191,36,0.65)',
    subject: 'rgba(167,139,250,0.55)',
    note:    'rgba(30,58,95,0.2)',
};

export const getNodeColor = (type) => NODE_COLORS[type]  || '#ffffff';
export const getGlowColor  = (type) => GLOW_COLORS[type] || 'rgba(255,255,255,0.3)';

/**
 * @param {Array<{key:string, url:string}>} fileObjects
 * @returns {{ nodes:Array, links:Array }}
 */
export function buildGraphData(fileObjects) {
    const nodeMap = new Map();
    const linkSet = new Set();
    const links   = [];

    const addNode = (id, name, level, type) => {
        if (!nodeMap.has(id)) nodeMap.set(id, { id, name, level, type });
    };
    const addLink = (source, target) => {
        const key = `${source}--${target}`;
        if (!linkSet.has(key)) { linkSet.add(key); links.push({ source, target }); }
    };

    // Central hub
    addNode(HUB_ID, 'APUNTES UDA', -1, 'hub');

    fileObjects.forEach(({ key, url }) => {
        const parts = key.split('/').filter(Boolean);
        if (parts.length < 4) return;

        const [career, year, subject, ...rest] = parts;
        const fileName = rest.join('/');

        const careerId  = `career:${career}`;
        const yearId    = `year:${career}/${year}`;
        const subjectId = `subject:${career}/${year}/${subject}`;
        const noteId    = `note:${key}`;

        addNode(careerId,  career,   0, 'career');
        addNode(yearId,    year,     1, 'year');
        addNode(subjectId, subject,  2, 'subject');
        addNode(noteId,    fileName, 3, 'note');
        nodeMap.get(noteId).url = url;

        addLink(HUB_ID,    careerId);
        addLink(careerId,  yearId);
        addLink(yearId,    subjectId);
        addLink(subjectId, noteId);
    });

    // ── Degree → node radius ────────────────────────────────────────
    const deg = new Map();
    links.forEach(({ source, target }) => {
        deg.set(source, (deg.get(source) || 0) + 1);
        deg.set(target, (deg.get(target) || 0) + 1);
    });

    nodeMap.forEach(node => {
        const d = deg.get(node.id) || 0;

        switch (node.type) {
            case 'hub':
                node.size = 16; // central star – absolute size
                break;
            case 'career':
                // 8–13px based on how many years it has
                node.size = Math.max(8, Math.min(13, 6 + d * 0.8));
                break;
            case 'year':
                // 4.5–8px
                node.size = Math.max(4.5, Math.min(8, 3.5 + d * 0.5));
                break;
            case 'subject':
                // 3–6px
                node.size = Math.max(3, Math.min(6, 2.5 + d * 0.4));
                break;
            default: // note
                node.size = 1.8; // fixed tiny dot
        }
    });

    // ── Neighbors for hover highlight ─────────────────────────────
    const neighbors = new Map();
    links.forEach(({ source, target }) => {
        if (!neighbors.has(source)) neighbors.set(source, new Set());
        if (!neighbors.has(target)) neighbors.set(target, new Set());
        neighbors.get(source).add(target);
        neighbors.get(target).add(source);
    });
    nodeMap.forEach(node => { node.neighbors = neighbors.get(node.id) || new Set(); });

    return { nodes: Array.from(nodeMap.values()), links };
}
