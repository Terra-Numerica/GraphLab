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
                        Un arbre couvrant de poids minimal, c'est un moyen de relier tous les ronds (sommets) d'un graphe avec des traits (arêtes), mais en utilisant le moins de longueur ou de coût possible.
                    </p>
                    <p>
                        Par exemple, imagine que tu veux relier plusieurs villes avec des routes : il faut que toutes les villes soient connectées, mais sans gaspiller de matériaux ou d'argent.
                    </p>
                    <p>
                        Chaque trait a un "poids" (comme le prix de la route). Le but est de trouver la meilleure façon de tout relier sans faire de boucle et en dépensant le moins possible.
                    </p>
                    <p>
                        C'est un vrai défi : comment relier tout le monde de la façon la plus efficace ? C'est ça, trouver l'arbre couvrant de poids minimal !
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