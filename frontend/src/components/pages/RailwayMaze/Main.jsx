// Imports
import { useNavigate } from 'react-router-dom';

import '../../../styles/pages/RailwayMaze/Main.css';

const RailwayMazeMain = () => {
    const navigate = useNavigate();
    
    const handleButtonPress = () => {
        navigate('/railway-maze/penrose');
    };

    return (
        <div className="railway-maze-container">
            <div className="explanation-section">
                <h2>Le problème du "Railway-Maze"</h2>
                <div className="explanation-text">
                    <p>
                        Le Railway-Maze est un problème de théorie des graphes qui consiste à naviguer dans un réseau ferroviaire 
                        en respectant des contraintes de couleur. Le joueur doit trouver un chemin valide entre deux points 
                        en utilisant uniquement les connexions autorisées selon les règles de couleur.
                    </p>
                    <p>
                        Dans ce jeu, vous devez naviguer de la station A vers la station B en suivant les rails colorés. 
                        Chaque rail a une couleur spécifique (orange ou bleu) et vous devez respecter les règles de transition 
                        entre les couleurs pour atteindre votre destination.
                    </p>
                    <p>
                        Les règles sont simples : vous pouvez emprunter un rail de la couleur actuelle, et certains rails 
                        vous permettent de changer de couleur. Votre objectif est de trouver le chemin optimal ou de déterminer 
                        s'il existe une solution au problème posé.
                    </p>
                </div>
                <button className="railway-maze-resolve-button" onClick={handleButtonPress}>
                    Essayer de résoudre
                </button>
            </div>
        </div>
    );
};

export default RailwayMazeMain;
