// Imports
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TutorialPopup from '../../common/TutorialPopup';

import '../../../styles/pages/RailwayMaze/RailwayMazeStyles.css';

const RailwayMazeMain = () => {
    const navigate = useNavigate();
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('hasSeenRailwayMazeTutorial') || sessionStorage.getItem('hasSeenRailwayMazeTutorial');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, []);

    const handleButtonPress = () => {
        navigate('/railway-maze/penrose');
    };

    const handleTutorialComplete = (dontShowAgain) => {
        if (dontShowAgain) {
            localStorage.setItem('hasSeenRailwayMazeTutorial', 'true');
        }
        sessionStorage.setItem('hasSeenRailwayMazeTutorial', 'true');
        setShowTutorial(false);
    };

    const handleTutorialClose = () => {
        sessionStorage.setItem('hasSeenRailwayMazeTutorial', 'true');
        setShowTutorial(false);
    };

    return (
        <div className="workshop-main-container">
            <div className="workshop-explanation-section">
                <h2>Le problème du "Labyrinthe Voyageur"</h2>
                <div className="workshop-explanation-text">
                    <p>
                        Vous êtes un conducteur de train qui devez trouver un chemin pour vous rendre du point de départ A au point d’arrivée B en suivant les rails d’un embranchement à un autre. Cependant, lorsque votre train arrive à un embranchement, les rails qui peuvent être empruntés pour poursuivre votre voyage dépendent de la voie par laquelle vous êtes arrivés à cet embranchement.  Saurez vous trouver un trajet de A à B satisfaisant ces contraintes ?
                    </p>
                    {/*<p>
                        Applications : Les contraintes reflètent le fait que la longueur d’un train l’empêche de suivre des virages trop serrés : par exemple, un train ne peut pas suivre des voies en forme d'épingle à cheveux, et encore moins faire demi tour. Ces contraintes sont également celles que l’on rencontre classiquement en voiture avec des sens interdits ou des interdictions de tourner dans telle ou telle direction.
                    </p>
                    <p>
                        Un peu de théorie ? Trouver un plus court chemin dans un réseau (graphe) avec ces contraintes additionnelles (on parle de transitions interdites) reste « facile » (polynomial) si on permet de passer plusieurs fois par un même noeud (sommet). En revanche, si on impose en plus de ne passer qu’au plus une fois par sommet, le problème devient « très difficile » (NP-complet).
                    </p>*/}
                </div>
                <button className="railway-maze-resolve-button" onClick={handleButtonPress}>
                    Essayer de résoudre
                </button>
            </div>
            {showTutorial && (
                <TutorialPopup
                    steps={
                        [
                            {
                                title: "Quelles sont les contraintes ?",
                                description: "Les contraintes reflètent le fait que la longueur d’un train l’empêche de suivre des virages trop serrés : par exemple, un train ne peut pas suivre des voies en forme d'épingle à cheveux, et encore moins faire demi tour. Ces contraintes sont également celles que l’on rencontre classiquement en voiture avec des sens interdits ou des interdictions de tourner dans telle ou telle direction. ",
                                //image: "/tutorial/RailwayMaze/graph.png",
                                status: "none"
                            },
                            {
                                title: "Un peu de théorie ?",
                                description: "Trouver un plus court chemin dans un réseau (graphe) avec ces contraintes additionnelles (on parle de transitions interdites) reste « facile » (polynomial) si on permet de passer plusieurs fois par un même noeud (sommet). En revanche, si on impose en plus de ne passer qu’au plus une fois par sommet, le problème devient « très difficile » (NP-complet). ",
                                //image: "/tutorial/RailwayMaze/graph.png",
                                status: "none"
                            }
                        ]
                    }
                    onClose={handleTutorialClose}
                    onComplete={handleTutorialComplete}
                />
            )}
        </div>
    );
};

export default RailwayMazeMain;
