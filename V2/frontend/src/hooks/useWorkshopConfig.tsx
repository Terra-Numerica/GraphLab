import { useState, useEffect } from 'react';
import config from '../config';
import { WorkshopConfig, WorkshopType } from '../types';

interface UseWorkshopConfigReturn {
    workshopConfig: WorkshopConfig | null;
    loading: boolean;
    error: string | null;
    isWorkshopAvailable: (workshopType: WorkshopType) => boolean;
}

const useWorkshopConfig = (): UseWorkshopConfigReturn => {
    const [workshopConfig, setWorkshopConfig] = useState<WorkshopConfig | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkshopConfig = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${config.apiUrl}/workshop`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch workshop configuration');
                }
                
                const data = await response.json();
                // Prendre le premier workshop (configuration globale)
                setWorkshopConfig(data[0] || null);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setError(errorMessage);
                console.error('Error fetching workshop config:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkshopConfig();
    }, []);

    // Fonction pour vérifier si un workshop est disponible dans l'environnement actuel
    const isWorkshopAvailable = (workshopType: WorkshopType): boolean => {
        if (!workshopConfig) return false;

		console.log(workshopConfig);
		console.log(workshopType);
        
        const isProduction = process.env.NODE_ENV === 'production';
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        const workshop = workshopConfig[workshopType];
        if (!workshop) return false;
        
        // Si les deux environnements sont activés, on affiche toujours
        if (workshop.production && workshop.development) {
            return true;
        }
        
        // Sinon, on vérifie l'environnement actuel
        if (isProduction && workshop.production) {
            return true;
        }
        
        if (isDevelopment && workshop.development) {
            return true;
        }
        
        return false;
    };

    return {
        workshopConfig,
        loading,
        error,
        isWorkshopAvailable
    };
};

export default useWorkshopConfig;
