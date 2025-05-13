import { useNavigate } from 'react-router-dom';

import '../../../styles/pages/ArbreCouvrant/Main.css';

const Main = () => {
    const navigate = useNavigate();

    const handleTryGraph = () => {
        navigate('/arbre-couvrant/try');
    };

    return (
        <div className="minimum-spanning-tree-container">
            <div className="explanation-section">
                <h2>L'Arbre Couvrant de Poids Minimal</h2>
                <div className="explanation-text">
                    <p>
                        Un arbre couvrant minimal est un sous-ensemble d'arêtes qui connecte tous les sommets d'un graphe en formant un arbre, tout en minimisant la somme des poids des arêtes utilisées.
                    </p>
                    <p>
                        Pour illustrer ce concept, prenons l'exemple d'un réseau de villes à connecter. L'objectif est de relier toutes les villes entre elles en utilisant le minimum de routes possible, tout en minimisant le coût total de construction.
                    </p>
                    <p>
                        Chaque arête du graphe possède un poids qui représente son coût. La solution optimale doit connecter tous les sommets sans former de cycle, tout en minimisant la somme des poids des arêtes sélectionnées.
                    </p>
                    <p>
                        Ce problème d'optimisation trouve des applications concrètes dans la planification de réseaux, comme la conception de réseaux électriques, de réseaux de communication ou de systèmes de distribution.
                    </p>
                </div>
                <button className="try-graph-button" onClick={handleTryGraph}>
                    Essayer un graphe
                </button>
            </div>
        </div>
    );
};

export default Main; 