// Imports
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import TutorialPopup from '../../common/TutorialPopup';

import '../../../styles/pages/Coloration/Main.css';

const Main = () => {

    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('hasSeenColorationTutorial') || sessionStorage.getItem('hasSeenColorationTutorial');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, []);

    const handleTutorialComplete = (dontShowAgain) => {
        if (dontShowAgain) {
            localStorage.setItem('hasSeenColorationTutorial', 'true');
        }
        sessionStorage.setItem('hasSeenColorationTutorial', 'true');
        setShowTutorial(false);
    };

    const handleTutorialClose = () => {
        sessionStorage.setItem('hasSeenColorationTutorial', 'true');
        setShowTutorial(false);
    };

    return (
        <div className="coloration-container">
            <div className="explanation-section">
                <h2>Coloration des Sommets</h2>
                <div className="explanation-text">
                    <p>
                        La coloration de graphe est un problème d'optimisation où chaque sommet doit recevoir une couleur distincte de ses sommets adjacents. Ce problème trouve son application dans l'allocation de ressources, comme la planification de fréquences pour des antennes de communication.
                    </p>
                    <p>
                        L'objectif est double : d'une part, respecter la contrainte d'adjacence en attribuant des couleurs différentes aux sommets reliés, et d'autre part, minimiser le nombre total de couleurs utilisées pour colorer l'ensemble du graphe.
                    </p>
                </div>
                <div className="coloration-modes">
                    <Link to="/coloration/defi" className="coloration-mode-btn">Mode défi</Link>
                    <Link to="/coloration/libre" className="coloration-mode-btn">Mode libre</Link>
                    <Link to="/coloration/creation" className="coloration-mode-btn">Mode création</Link>
                </div>
            </div>
            {showTutorial && (
                <TutorialPopup
                    steps={
                        [
                            {
                                title: "Graphe (Coloration)",
                                description: "Voici un graphe, tu dois le colorer avec le moins de couleurs possible.",
                                image: "/tutorial/Coloration/graph.png"
                            },
                            {
                                title: "Coloration avec 2 couleurs adjacentes",
                                description: "Ici, nous avons un graphe coloré avec 2 couleurs adjacentes, cela n'est pas valide.",
                                image: "/tutorial/Coloration/2-colors.png"
                            },
                            {
                                title: "Coloration valide mais non optimale",
                                description: "Ici, nous avons un graphe coloré avec 4 couleurs, cela est valide mais non optimale.",
                                image: "/tutorial/Coloration/3-colors.png"
                            },
                            {
                                title: "Coloration optimale",
                                description: "Ici, nous avons un graphe coloré avec 3 couleurs, cela est valide et optimal.",
                                image: "/tutorial/Coloration/optimal-coloring.png"
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

export default Main; 