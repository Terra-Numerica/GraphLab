import { Link } from 'react-router-dom';

import '../../../styles/pages/Coloration/Main.css';

const Main = () => {
    return (
        <div className="coloration-container">
            <div className="explanation-section">
                <h2>Coloration des Sommets</h2>
                <div className="explanation-text">
                    <p>
                        Imagine que chaque sommet d'un graphe est une antenne. Si deux antennes sont trop proches (reliées par un trait), elles ne doivent pas utiliser la même couleur pour éviter les interférences !
                    </p>
                    <p>
                        Le but de la coloration des sommets est donc de colorer chaque sommet de façon à ce que deux sommets reliés n'aient jamais la même couleur. On cherche aussi à utiliser le moins de couleurs possible !
                    </p>
                </div>
                <div className="coloration-modes">
                    <Link to="/coloration/defi" className="coloration-mode-btn">Mode défi</Link>
                    <Link to="/coloration/libre" className="coloration-mode-btn">Mode libre</Link>
                    <Link to="/coloration/creation" className="coloration-mode-btn">Mode création</Link>
                </div>
            </div>
        </div>
    );
};

export default Main; 