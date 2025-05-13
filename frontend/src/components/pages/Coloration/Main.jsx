import { Link } from 'react-router-dom';

import '../../../styles/pages/Coloration/Main.css';

const Main = () => {
    return (
        <div className="coloration-container">
            <div className="explanation-section">
                <h2>Coloration des Sommets</h2>
                <div className="explanation-text">
                    <p>
                        La coloration de graphe est un problème d'optimisation où chaque sommet doit recevoir une couleur distincte de ses sommets adjacents. Ce problème trouve son application dans l'allocation de ressources, comme la planification de fréquences pour des antennes de communication.
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
        </div>
    );
};

export default Main; 