import React from 'react';
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
                        Un graphe, c'est des ronds (qu'on appelle "sommets") reliés par des traits (qu'on appelle "arêtes").
                    </p>
                    <p>
                        Les graphes sont omniprésents : dans les réseaux sociaux (facebook, youtube, etc..), les réseaux de transport, les labyrinthes, etc.
                    </p>
                    <p>
                        Graphlab est un site web où tu va découvrir différents types de graphes et apprendre à les utiliser.
                    </p>
                </div>
            </div>

            <div className="workshops-section">
                <h2>Nos Ateliers</h2>
                <div className="workshops-grid">
                    <div className="workshop-card-vertical">
                        <div className="workshop-icon-vertical">🎨</div>
                        <div className="workshop-title-vertical">Coloration des Sommets</div>
                        <div className="workshop-desc-vertical">Colorie les sommets d'un graphe pour que deux sommets reliés n'aient jamais la même couleur !</div>
                        <Link to="/coloration" className="workshop-play-btn">Jouer</Link>
                    </div>
                    <div className="workshop-card-vertical">
                        <div className="workshop-icon-vertical">🌳</div>
                        <div className="workshop-title-vertical">L'Arbre Couvrant</div>
                        <div className="workshop-desc-vertical">Trouve l'arbre couvrant de poids minimal d'un graphe !</div>
                        <Link to="/arbre-couvrant" className="workshop-play-btn">Jouer</Link>
                    </div>
                    {/* D'autres ateliers seront ajoutés ici */}
                </div>
            </div>
        </div>
    );
};

export default Home; 