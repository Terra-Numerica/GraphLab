import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TutorialPopup from '../../common/TutorialPopup';

import '../../../styles/pages/ArbreCouvrant/Main.css';

const Main = () => {
    const navigate = useNavigate();
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('hasSeenMSTTutorial') || sessionStorage.getItem('hasSeenMSTTutorial');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, []);

    const handleTryGraph = () => {
        navigate('/arbre-couvrant/try');
    };

    const handleTutorialComplete = (dontShowAgain) => {
        if (dontShowAgain) {
            localStorage.setItem('hasSeenMSTTutorial', 'true');
        }
        sessionStorage.setItem('hasSeenMSTTutorial', 'true');
        setShowTutorial(false);
    };

    const handleTutorialClose = () => {
        sessionStorage.setItem('hasSeenMSTTutorial', 'true');
        setShowTutorial(false);
    };

    return (
        <div className="minimum-spanning-tree-container">
            <div className="explanation-section">
                <h2>L'Arbre Couvrant de Poids Minimal</h2>
                <div className="explanation-text">
                    <p>
                        Un arbre couvrant minimal est un sous-ensemble d'arêtes qui connecte tous les sommets (composantes) d'un graphe en formant un arbre, tout en minimisant la somme des poids des arêtes utilisées.
                    </p>
                    <p>
                        Chaque arête du graphe possède un poids qui représente son coût. La solution optimale doit connecter tous les composantes sans former de cycle, tout en minimisant la somme des poids des arêtes sélectionnées.
                    </p>
                </div>
                <button className="try-graph-button" onClick={handleTryGraph}>
                    Essayer un graphe
                </button>
            </div>
            {showTutorial && (
                <TutorialPopup
                    steps={
                        [
                            {
                                title: "Qu'est-ce qu'un arbre couvrant ?",
                                description: "Un arbre couvrant est un sous-ensemble d'arêtes qui connecte tous les sommets (qu'on peut appeler composantes) d'un graphe sans former de cycle. Chaque arête possède un poids (coût). <br /> L'objectif est de trouver l'arbre couvrant de poids minimal.",
                                image: "/tutorial/ArbreCouvrant/graph.png",
                                status: "none"
                            },
                            {
                                title: "Le principe de l'arbre couvrant",
                                description: "Un arbre couvrant doit :<br />1) Connecter toutes les composantes<br />2) Ne pas former de cycle<br />3) Minimiser la somme des poids des arêtes sélectionnées",
                                image: "/tutorial/ArbreCouvrant/graph.png",
                                status: "none"
                            },
                            {
                                title: "Cycle détecté",
                                description: "Ici, c'est incorrect ! Un cycle a été formé (boucle fermée). Un arbre ne peut pas contenir de cycles. Il faut retirer une arête pour casser le cycle.",
                                image: "/tutorial/ArbreCouvrant/cycle.png",
                                status: "no"
                            },
                            {
                                title: "Correct mais pas optimal",
                                description: "Maintenant c'est correct : toutes les composantes sont connectées sans cycle. Mais la somme des poids n'est pas minimale. On peut faire mieux en choisissant des arêtes moins coûteuses.",
                                image: "/tutorial/ArbreCouvrant/non-minimal.png",
                                status: "no"
                            },
                            {
                                title: "Parfait ! Solution optimale",
                                description: "Excellent ! C'est l'arbre couvrant minimal : toutes les composantes sont connectées, aucun cycle, et la somme des poids est minimale. C'est exactement ce qu'il faut trouver !",
                                image: "/tutorial/ArbreCouvrant/minimal.png",
                                status: "yes"
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