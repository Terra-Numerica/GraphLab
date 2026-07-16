import { useState, useEffect } from 'react';
import config from '../config';

export const useFetchGraphs = (params) => {
    const [graphs, setGraphs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            } catch (error) {
                setError('Impossible de récupérer la liste des graphes');
            } finally {
                setLoading(false);
            }
        };
        fetchGraphs();
    }, [params]);

    return { graphs, loading, error };
};

export const useFetchGraph = (params) => {
    const [graph, setGraph] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            } catch (error) {
                setError('Impossible de récupérer le graphe');
            } finally {
                setLoading(false);
            }
        };
        fetchGraph();
    }, [params.id]);

    return { graph, loading, error };
};