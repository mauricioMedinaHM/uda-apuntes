import { useState, useEffect } from 'react';
import KnowledgeGraph from '../components/KnowledgeGraph';
import { fetchAllFileKeys } from '../services/graphDataService';
import { buildGraphData } from '../utils/graphDataUtils';
import { Network, RefreshCw, AlertCircle } from 'lucide-react';

export default function GraphView() {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const fileObjects = await fetchAllFileKeys();
            if (fileObjects.length === 0) {
                setError('No se encontraron archivos en el repositorio.');
                return;
            }
            setGraphData(buildGraphData(fileObjects));
        } catch (err) {
            console.error('Error loading graph data:', err);
            setError('Error al cargar los datos del grafo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    /* ── Loading ── */
    if (loading) {
        return (
            <div
                className="flex flex-col items-center justify-center"
                style={{ minHeight: 'calc(100vh - 64px)', background: '#020b18' }}
            >
                <div className="flex flex-col items-center gap-5">
                    {/* Animated ring */}
                    <div className="relative w-16 h-16">
                        <div
                            className="absolute inset-0 rounded-full border-2 border-blue-900"
                        />
                        <div
                            className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"
                            style={{ animationDuration: '1s' }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Network className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-white font-semibold mb-1">Cargando grafo...</p>
                        <p className="text-slate-500 text-sm">Obteniendo estructura del repositorio</p>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Error ── */
    if (error) {
        return (
            <div
                className="flex flex-col items-center justify-center"
                style={{ minHeight: 'calc(100vh - 64px)', background: '#020b18' }}
            >
                <div className="flex flex-col items-center gap-5 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-7 h-7 text-red-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-white font-semibold mb-1">{error}</p>
                        <p className="text-slate-500 text-sm">Verificá tu conexión e intentá de nuevo</p>
                    </div>
                    <button
                        onClick={load}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-blue-300 border border-blue-600/25 hover:bg-blue-600/10 transition-all duration-200"
                    >
                        <RefreshCw className="w-4 h-4" strokeWidth={2} />
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return <KnowledgeGraph data={graphData} />;
}
