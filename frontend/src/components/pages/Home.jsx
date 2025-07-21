import { Link } from 'react-router-dom';

import '../../styles/pages/Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <div className="intro-section">
                <h1>Bienvenue sur GraphLab</h1>
                <div className="graph-explanation">
                    <h2>Qu'est-ce qu'un graphe ?</h2>
                    <p>
                        Un graphe est un objet composé de sommets (ou nœuds) et d'arêtes (ou arcs, dans certains cas) qui relient les sommets.
                    </p>
                    <p>
                        On peut voir un graphe comme une carte géographique : les sommets sont alors des villes et les arêtes sont les routes qui mènent d'une ville à l'autre.
                    </p>
                    <img src="/graphe.png" alt="graphe" className="graph-image" />
                </div>
            </div>

            <div className="workshops-section">
                <h2>Nos Ateliers</h2>
                <div className="workshops-grid">
                    <div className="workshop-card-vertical">
                        <div className="workshop-icon-vertical">🎨</div>
                        <div className="workshop-title-vertical">Coloration des Sommets</div>
                        <div className="workshop-desc-vertical">Explore le problème de coloration des graphes : attribue des couleurs aux sommets en respectant la contrainte d'adjacence.</div>
                        <Link to="/coloration" className="workshop-play-btn">Jouer</Link>
                    </div>
                    <div className="workshop-card-vertical">
                        <div className="workshop-icon-vertical">🌳</div>
                        <div className="workshop-title-vertical">L'Arbre Couvrant</div>
                        <div className="workshop-desc-vertical">Trouve l'arbre couvrant minimal : un sous-graphe qui connecte tous les sommets avec un poids total minimal.</div>
                        <Link to="/arbre-couvrant" className="workshop-play-btn">Jouer</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home; 