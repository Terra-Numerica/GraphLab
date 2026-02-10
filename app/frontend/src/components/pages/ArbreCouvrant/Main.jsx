import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TutorialPopup from '../../common/TutorialPopup';

// ❌ plus besoin : import '../../../styles/pages/ArbreCouvrant/ArbreCouvrantStyles.css';

const Main = () => {
    const navigate = useNavigate();
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const hasSeenTutorial =
            localStorage.getItem('hasSeenMSTTutorial') ||
            sessionStorage.getItem('hasSeenMSTTutorial');
        if (!hasSeenTutorial) setShowTutorial(true);
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
        <div className="w-full bg-gray-100 flex flex-col px-4 sm:px-8 md:px-16 py-12">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow p-6 md:p-8 mx-auto my-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-darkBlue mb-6 text-center">
                    L&apos;Arbre Couvrant de Poids Minimal
                </h2>

                <div className="space-y-5 text-astro text-base md:text-lg leading-relaxed">
                    <p>
                        Un arbre couvrant minimal est un sous-ensemble d&apos;arêtes qui connecte
                        tous les sommets (composantes) d&apos;un graphe en formant un arbre, tout en
                        minimisant la somme des poids des arêtes utilisées.
                    </p>
                    <p>
                        Chaque arête du graphe possède un poids qui représente son coût. La
                        solution optimale doit connecter tous les composantes sans former de cycle,
                        tout en minimisant la somme des poids des arêtes sélectionnées.
                    </p>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleTryGraph}
                        className="inline-flex items-center justify-center rounded-xl border-2 border-blue text-blue font-semibold px-6 py-3 text-lg hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
                    >
                        Essayer un graphe
                    </button>
                </div>
            </div>

            {showTutorial && (
                <TutorialPopup
                    steps={[
                        {
                            title: "Qu'est-ce qu'un arbre couvrant ?",
                            description:
                                "Un arbre couvrant est un sous-ensemble d'arêtes qui connecte tous les sommets d'un graphe sans former de cycle. Chaque arête possède un poids (coût). <br /> L'objectif est de trouver l'arbre couvrant de poids minimal.",
                            image: '/tutorial/ArbreCouvrant/graph.png',
                            status: 'none',
                        },
                        {
                            title: "Le principe de l'arbre couvrant",
                            description:
                                "Un arbre couvrant doit :<br />1) Avoir une seule composante (tous les sommets connectés)<br />2) Ne pas former de cycle<br />3) Minimiser la somme des poids des arêtes sélectionnées",
                            image: '/tutorial/ArbreCouvrant/graph.png',
                            status: 'none',
                        },
                        {
                            title: 'Cycle détecté',
                            description:
                                "Ici, c'est incorrect ! Un cycle a été formé (boucle fermée). Un arbre ne peut pas contenir de cycles. Il faut retirer une arête pour casser le cycle.",
                            image: '/tutorial/ArbreCouvrant/cycle.png',
                            status: 'no',
                        },
                        {
                            title: 'Correct mais pas optimal',
                            description:
                                "Maintenant c'est correct : il n'y a qu'une composante, tous les sommets sont connectés sans cycle. Mais la somme des poids n'est pas minimale. On peut faire mieux en choisissant des arêtes moins coûteuses.",
                            image: '/tutorial/ArbreCouvrant/non-minimal.png',
                            status: 'no',
                        },
                        {
                            title: 'Parfait ! Solution optimale',
                            description:
                                "Excellent ! C'est l'arbre couvrant minimal : il n'y a qu'une composante, tous les sommets sont connectés, aucun cycle, et la somme des poids est minimale. C'est exactement ce qu'il faut trouver !",
                            image: '/tutorial/ArbreCouvrant/minimal.png',
                            status: 'yes',
                        },
                    ]}
                    onClose={handleTutorialClose}
                    onComplete={handleTutorialComplete}
                />
            )}
        </div>
    );
};

export default Main;
