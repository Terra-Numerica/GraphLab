import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TutorialPopup from '../../common/TutorialPopup';
// ❌ plus besoin : import '../../../styles/pages/RailwayMaze/RailwayMazeStyles.css';

const RailwayMazeMain = () => {
    const navigate = useNavigate();
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const hasSeenTutorial =
            localStorage.getItem('hasSeenRailwayMazeTutorial') ||
            sessionStorage.getItem('hasSeenRailwayMazeTutorial');
        if (!hasSeenTutorial) setShowTutorial(true);
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
        <div className="w-full bg-gray-100 flex flex-col px-4 sm:px-8 md:px-16 py-12">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow p-6 md:p-8 mx-auto my-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-darkBlue mb-6 text-center">
                    Le problème du &quot;Labyrinthe Voyageur&quot;
                </h2>

                <div className="space-y-5 text-astro text-base md:text-lg leading-relaxed">
                    <p>
                        Vous êtes un conducteur de train qui devez trouver un chemin pour vous rendre du point de départ A au point d'arrivée B en suivant les rails d'un embranchement à un autre.
                    </p>
                    <p>
                        Cependant, lorsque votre train arrive à un embranchement, les rails qui peuvent être empruntés pour poursuivre votre voyage dépendent de la voie par laquelle vous êtes arrivés à cet embranchement.
                    </p>
                    <p>
                        <strong>Saurez-vous trouver un trajet de A à B satisfaisant ces contraintes ?</strong>
                    </p>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleButtonPress}
                        className="inline-flex items-center justify-center rounded-xl border-2 border-blue text-blue font-semibold px-6 py-3 text-lg hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
                    >
                        Essayer de résoudre
                    </button>
                </div>
            </div>

            {/* Tutoriel */}
            {showTutorial && (
                <TutorialPopup
                    steps={[
                        {
                            title: "Quelles sont les contraintes ?",
                            description:
                                "Les contraintes reflètent le fait que la longueur d'un train l'empêche de suivre des virages trop serrés : par exemple, un train ne peut pas suivre des voies en forme d'épingle à cheveux, et encore moins faire demi tour.<br /><br />Ces contraintes sont également celles que l'on rencontre classiquement en voiture avec des sens interdits ou des interdictions de tourner dans telle ou telle direction.",
                            image: '/tutorial/RailwayMaze/constraints.png',
                            status: 'none',
                        },
                        {
                            title: "Un peu de théorie ?",
                            description:
                                "Trouver un plus court chemin dans un réseau (graphe) avec ces contraintes additionnelles (on parle de <strong>transitions interdites</strong>) reste « facile » (polynomial) si on permet de passer plusieurs fois par un même nœud (sommet).<br /><br />En revanche, si on impose en plus de ne passer qu'<strong>au plus une fois par sommet</strong>, le problème devient « très difficile » (<strong>NP-complet</strong>).",
                            image: '/tutorial/RailwayMaze/theory.png',
                            status: 'none',
                        },
                    ]}
                    onClose={handleTutorialClose}
                    onComplete={handleTutorialComplete}
                />
            )}
        </div>
    );
};

export default RailwayMazeMain;