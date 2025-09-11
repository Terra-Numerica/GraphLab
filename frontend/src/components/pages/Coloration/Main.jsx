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
                        La coloration de graphe est un problème d'optimisation où chaque sommet doit recevoir une couleur distincte des sommets auxquels il est adjacent, c’est-à-dire relié par une arête. Ce problème trouve son application dans l'allocation de ressources, comme la planification de fréquences pour des antennes de communication.
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
                                title: "Coloration de graphe",
                                description: "Un graphe est un ensemble de points (appelés sommets) reliés entre eux par des traits (appelés arêtes). Le but est d'attribuer une couleur à chaque sommet.",
                                image: "/tutorial/Coloration/graph.png",
                                status: "none"
                            },
                            {
                                title: "Mauvaise pratique",
                                description: "Deux sommets reliés par une arête ne peuvent pas avoir la même couleur. Ici, ce n'est pas valide car deux sommets rouges et deux sommets bleus sont adjacents.",
                                image: "/tutorial/Coloration/2-colors.png",
                                status: "no"
                            },
                            {
                                title: "Bonne pratique mais pas optimale",
                                description: "La règle est respectée : aucun sommet relié n'a la même couleur. Cependant, on utilise 4 couleurs alors qu'il serait possible de faire mieux.",
                                image: "/tutorial/Coloration/3-colors.png",
                                status: "yes"
                            },
                            {
                                title: "Bonne pratique optimale",
                                description: "Le graphe est coloré avec seulement 3 couleurs. C'est à la fois correct (aucune erreur) et optimal (minimum de couleurs).",
                                image: "/tutorial/Coloration/optimal-coloring.png",
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