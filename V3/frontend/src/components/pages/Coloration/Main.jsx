import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TutorialPopup from '../../common/TutorialPopup';

const Main = () => {
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        const hasSeenTutorial =
            localStorage.getItem('hasSeenColorationTutorial') ||
            sessionStorage.getItem('hasSeenColorationTutorial');
        if (!hasSeenTutorial) setShowTutorial(true);
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
        <div className="w-full bg-gray-100 flex items-center justify-center px-4 sm:px-8 md:px-16 py-8">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow p-6 md:p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-darkBlue mb-6 text-center">
                    Coloration des Sommets
                </h2>

                <div className="space-y-5 text-astro text-base md:text-lg leading-relaxed">
                    <p>
                        La coloration de graphe est un problème d'optimisation où chaque
                        sommet doit recevoir une couleur distincte des sommets auxquels il
                        est adjacent, c’est-à-dire relié par une arête. Ce problème trouve
                        son application dans l'allocation de ressources, comme la
                        planification de fréquences pour des antennes de communication.
                    </p>
                    <p>
                        L'objectif est double : d'une part, respecter la contrainte
                        d'adjacence en attribuant des couleurs différentes aux sommets
                        reliés, et d'autre part, minimiser le nombre total de couleurs
                        utilisées pour colorer l'ensemble du graphe.
                    </p>
                </div>

                {/* Modes */}
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
                    <Link
                        to="/coloration/defi"
                        className="flex-1 inline-flex items-center justify-center rounded-xl border-2 border-blue px-6 py-3 text-lg font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40 text-center no-underline"
                    >
                        Mode défi
                    </Link>
                    <Link
                        to="/coloration/libre"
                        className="flex-1 inline-flex items-center justify-center rounded-xl border-2 border-blue px-6 py-3 text-lg font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40 text-center no-underline"
                    >
                        Mode libre
                    </Link>
                    <Link
                        to="/coloration/creation"
                        className="flex-1 inline-flex items-center justify-center rounded-xl border-2 border-blue px-6 py-3 text-lg font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40 text-center no-underline"
                    >
                        Mode création
                    </Link>
                </div>
            </div>

            {/* Tutoriel */}
            {showTutorial && (
                <TutorialPopup
                    steps={[
                        {
                            title: "Qu'est-ce qu'un graphe ?",
                            description:
                                "Un graphe est composé de sommets (les cercles) reliés par des arêtes (les lignes droites ou courbes).",
                            image: '/graphe.png',
                            status: 'none',
                        },
                        {
                            title: 'Le principe de la coloration',
                            description:
                                "L'objectif est de colorier chaque sommet avec une couleur, mais avec une règle importante : <br /> - deux sommets adjacents (reliés par une arête) ne peuvent jamais avoir la même couleur.",
                            image: '/tutorial/Coloration/graph.png',
                            status: 'none',
                        },
                        {
                            title: 'Même couleur pour des sommets adjacents',
                            description:
                                "Ici, c'est incorrect ! Les sommets rouges et bleus sont adjacents (reliés par des arêtes). <br /> C'est interdit ! Chaque arête doit relier deux sommets de couleurs différentes.",
                            image: '/tutorial/Coloration/2-colors.png',
                            status: 'no',
                        },
                        {
                            title: 'Solution non optimale',
                            description:
                                "Maintenant c'est correct : aucun sommet adjacent n'a la même couleur. <br /> Mais on utilise 4 couleurs alors qu'on pourrait faire mieux. L'objectif est d'utiliser le minimum de couleurs possible.",
                            image: '/tutorial/Coloration/3-colors.png',
                            status: 'no',
                        },
                        {
                            title: 'Parfait ! Solution optimale',
                            description:
                                "Excellent ! Le graphe est correctement coloré avec seulement 3 couleurs. <br /> C'est la solution optimale : respecte la règle ET utilise le minimum de couleurs. <br /> C'est exactement ce qu'il faut faire !",
                            image: '/tutorial/Coloration/optimal-coloring.png',
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
