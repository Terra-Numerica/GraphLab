import { Link } from 'react-router-dom';
import useWorkshopConfig from '../../hooks/useWorkshopConfig';

import '../../styles/pages/Home.css';

const Home = () => {
    const { isWorkshopAvailable, loading } = useWorkshopConfig();

    if (loading) {
        return (
            <div className="home-container">
                <div className="intro-section">
                    <h1>Bienvenue sur GraphLab</h1>
                    <p>Chargement des ateliers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            <div className="intro-section">
                <h1>Bienvenue sur GraphLab</h1>
                <div className="graph-explanation">
                    <h2>Qu'est-ce qu'un graphe ?</h2>
                    <p>
                        Un graphe est un objet composé de sommets (représentés par des cercles) et d'arêtes (représentées par des lignes droites ou courbes) qui relient les sommets.
                    </p>
                    <p>
                        On peut voir un graphe comme une carte géographique : les sommets sont alors des villes et les arêtes sont les routes qui mènent d'une ville à l'autre.
                    </p>
                    <div className="graphs-examples">
                        <div className="graph-example">
                            <img src="/metro-paris.png" alt="Plan du métro parisien" className="graph-image-small" />
                            <p className="graph-caption">Plan du métro parisien</p>
                        </div>
                        <div className="graph-example">
                            <img src="/graphe.png" alt="Graphe général" className="graph-image-small" />
                            <p className="graph-caption">Graphe général</p>
                        </div>
                        <div className="graph-example">
                            <img src="/reseau-social.png" alt="Réseau social" className="graph-image-small" />
                            <p className="graph-caption">Réseau social</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="workshops-section">
                <h2>Nos Ateliers</h2>
                <div className="workshops-grid">
                    {isWorkshopAvailable('coloring') && (
                        <div className="workshop-card-vertical">
                            <div className="workshop-icon-vertical">🎨</div>
                            <div className="workshop-title-vertical">Coloration des Sommets</div>
                            <div className="workshop-desc-vertical">Explore le problème de coloration des graphes : attribue des couleurs aux sommets en respectant la contrainte d'adjacence.</div>
                            <Link to="/coloration" className="workshop-play-btn">Jouer</Link>
                        </div>
                    )}
                    {isWorkshopAvailable('spanningTree') && (
                        <div className="workshop-card-vertical">
                            <div className="workshop-icon-vertical">🌳</div>
                            <div className="workshop-title-vertical">L'Arbre Couvrant</div>
                            <div className="workshop-desc-vertical">Trouve l'arbre couvrant minimal : un sous-graphe qui connecte tous les sommets avec un poids total minimal.</div>
                            <Link to="/arbre-couvrant" className="workshop-play-btn">Jouer</Link>
                        </div>
                    )}
                    {isWorkshopAvailable('railwayMaze') && (
                        <div className="workshop-card-vertical">
                            <div className="workshop-icon-vertical">🚂</div>
                            <div className="workshop-title-vertical">Railway Maze</div>
                            <div className="workshop-desc-vertical">Résous le labyrinthe ferroviaire en suivant les règles de couleur des rails.</div>
                            <Link to="/railway-maze" className="workshop-play-btn">Jouer</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home; 