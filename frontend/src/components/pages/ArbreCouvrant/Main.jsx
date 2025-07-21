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
            {showTutorial && (
                <TutorialPopup
                    steps={
                        [
                            {
                                title: "Graphe (Arbre Couvrant)",
                                description: "Voici un arbre couvrant (vide), il est composé de 5 sommets et 4 arêtes, chaque arrête possède un poids. Tu dois trouver l'arbre couvrant de poids minimal.",
                                image: "/tutorial/ArbreCouvrant/graph.png"
                            },
                            {
                                title: "Solution avec Cycle",
                                description: "Ici, nous avons un arbre couvrant valide, mais il contient un cycle. Un arbre ne doit pas contenir de cycles.",
                                image: "/tutorial/ArbreCouvrant/cycle.png"
                            },
                            {
                                title: "Arbre Couvrant Non Minimal",
                                description: "Dans ce cas, nous avons un arbre couvrant valide, mais il n'est pas minimal car la somme des poids des arêtes n'est pas minimale.",
                                image: "/tutorial/ArbreCouvrant/non-minimal.png"
                            },
                            {
                                title: "Arbre Couvrant Minimal",
                                description: "Et enfin, un arbre couvrant minimal valide. Il connecte tous les sommets sans cycle et avec la somme des poids minimale.",
                                image: "/tutorial/ArbreCouvrant/minimal.png"
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