import { useState, useEffect } from 'react';
import config from '../config';
import { Graph } from '../types';

interface UseFetchGraphsParams {
    [key: string]: string | number | boolean | undefined;
}

interface UseFetchGraphParams {
    id: string;
}

interface UseFetchGraphsReturn {
    graphs: Graph[];
    loading: boolean;
    error: string | null;
}

interface UseFetchGraphReturn {
    graph: Graph | null;
    loading: boolean;
    error: string | null;
}

export const useFetchGraphs = (params?: UseFetchGraphsParams): UseFetchGraphsReturn => {
    const [graphs, setGraphs] = useState<Graph[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        const fetchGraphs = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/graph`);

                if (!response.ok) {
                    setError('Impossible de récupérer la liste des graphes');
                    return;
                }

                const data = await response.json();

                setGraphs(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Impossible de récupérer la liste des graphes';
                setError(errorMessage);
                console.error('Error fetching graphs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGraphs();
    }, [params]);

    return { graphs, loading, error };
};

export const useFetchGraph = (params: UseFetchGraphParams): UseFetchGraphReturn => {
    const [graph, setGraph] = useState<Graph | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        const fetchGraph = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/graph/${params.id}`);

                if (!response.ok) {
                    setError('Impossible de récupérer le graphe');
                    return;
                }

                const data = await response.json();

                setGraph(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Impossible de récupérer le graphe';
                setError(errorMessage);
                console.error('Error fetching graph:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGraph();
    }, [params.id]);

    return { graph, loading, error };
};