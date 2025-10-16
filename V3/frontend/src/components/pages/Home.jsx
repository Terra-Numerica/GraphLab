import { Link } from 'react-router-dom';
import useWorkshopConfig from '../../hooks/useWorkshopConfig';

// ❌ plus besoin : import '../../styles/pages/Home.css';

const Home = () => {
    const { isWorkshopAvailable, loading } = useWorkshopConfig();

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 md:px-8 py-10">
                <section className="rounded-2xl bg-white p-8 shadow-sm">
                    <h1 className="text-darkBlue mb-3 text-3xl font-bold tracking-wide drop-shadow-sm">
                        Bienvenue sur GraphLab
                    </h1>
                    <p className="text-astro/80 animate-pulse">Chargement des ateliers...</p>
                </section>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 md:px-8 py-10">
            {/* Intro */}
            <section className="intro-section rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="text-darkBlue mb-6 text-3xl md:text-4xl font-bold tracking-wide drop-shadow-sm">
                    Bienvenue sur GraphLab
                </h1>

                <div className="graph-explanation space-y-4">
                    <h2 className="text-2xl font-semibold text-darkBlue">Qu&apos;est-ce qu&apos;un graphe ?</h2>
                    <p className="text-astro leading-relaxed">
                        Un graphe est un objet composé de sommets (représentés par des cercles) et d&apos;arêtes (représentées par des lignes droites ou courbes) qui relient les sommets.
                    </p>
                    <p className="text-astro leading-relaxed">
                        On peut voir un graphe comme une carte géographique : les sommets sont alors des villes et les arêtes sont les routes qui mènent d&apos;une ville à l&apos;autre.
                    </p>

                    <div className="graphs-examples grid grid-cols-1 gap-6 sm:grid-cols-3 pt-4">
                        <div className="graph-example flex flex-col items-center gap-3 rounded-xl border border-grey bg-gray-50 p-4">
                            <img
                                src="/metro-paris.png"
                                alt="Plan du métro parisien"
                                className="graph-image-small h-40 w-auto object-contain rounded-lg shadow"
                            />
                            <p className="graph-caption text-sm text-astro/80">Plan du métro parisien</p>
                        </div>

                        <div className="graph-example flex flex-col items-center gap-3 rounded-xl border border-grey bg-gray-50 p-4">
                            <img
                                src="/graphe.png"
                                alt="Graphe général"
                                className="graph-image-small h-40 w-auto object-contain rounded-lg shadow"
                            />
                            <p className="graph-caption text-sm text-astro/80">Graphe général</p>
                        </div>

                        <div className="graph-example flex flex-col items-center gap-3 rounded-xl border border-grey bg-gray-50 p-4">
                            <img
                                src="/reseau-social.png"
                                alt="Réseau social"
                                className="graph-image-small h-40 w-auto object-contain rounded-lg shadow"
                            />
                            <p className="graph-caption text-sm text-astro/80">Réseau social</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Workshops */}
            <section className="workshops-section mt-10">
                <h2 className="mb-6 text-2xl font-semibold text-darkBlue">Nos Ateliers</h2>

                <div className="workshops-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {isWorkshopAvailable('coloring') && (
                        <div className="workshop-card-vertical group flex flex-col items-start gap-3 rounded-2xl border border-grey bg-white p-6 shadow-sm transition hover:shadow-md">
                            <div className="workshop-icon-vertical text-3xl">🎨</div>
                            <div className="workshop-title-vertical text-lg font-semibold text-darkBlue">
                                Coloration des Sommets
                            </div>
                            <div className="workshop-desc-vertical text-sm text-astro/80">
                                Explore le problème de coloration des graphes : attribue des couleurs aux sommets en respectant la contrainte d&apos;adjacence.
                            </div>
                            <Link
                                to="/coloration"
                                className="workshop-play-btn mt-1 inline-flex items-center justify-center rounded-xl bg-blue px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-hover focus:outline-none focus:ring-2 focus:ring-blue/40"
                            >
                                Jouer
                            </Link>
                        </div>
                    )}

                    {isWorkshopAvailable('spanningTree') && (
                        <div className="workshop-card-vertical group flex flex-col items-start gap-3 rounded-2xl border border-grey bg-white p-6 shadow-sm transition hover:shadow-md">
                            <div className="workshop-icon-vertical text-3xl">🌳</div>
                            <div className="workshop-title-vertical text-lg font-semibold text-darkBlue">
                                L&apos;Arbre Couvrant
                            </div>
                            <div className="workshop-desc-vertical text-sm text-astro/80">
                                Trouve l&apos;arbre couvrant minimal : un sous-graphe qui connecte tous les sommets avec un poids total minimal.
                            </div>
                            <Link
                                to="/arbre-couvrant"
                                className="workshop-play-btn mt-1 inline-flex items-center justify-center rounded-xl bg-blue px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-hover focus:outline-none focus:ring-2 focus:ring-blue/40"
                            >
                                Jouer
                            </Link>
                        </div>
                    )}

                    {isWorkshopAvailable('railwayMaze') && (
                        <div className="workshop-card-vertical group flex flex-col items-start gap-3 rounded-2xl border border-grey bg-white p-6 shadow-sm transition hover:shadow-md">
                            <div className="workshop-icon-vertical text-3xl">🚂</div>
                            <div className="workshop-title-vertical text-lg font-semibold text-darkBlue">
                                Railway Maze
                            </div>
                            <div className="workshop-desc-vertical text-sm text-astro/80">
                                Résous le labyrinthe ferroviaire en suivant les règles de couleur des rails.
                            </div>
                            <Link
                                to="/railway-maze"
                                className="workshop-play-btn mt-1 inline-flex items-center justify-center rounded-xl bg-blue px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-hover focus:outline-none focus:ring-2 focus:ring-blue/40"
                            >
                                Jouer
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;