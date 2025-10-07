import React from 'react';
import '../../styles/common/MobileWarning.css';

const MobileWarning: React.FC = () => {
    return (
        <div className="mobile-warning">
            <div className="mobile-warning-content">
                <h2>Application non disponible sur mobile</h2>
                <p>
                    Désolé, GraphLab n'est pas encore optimisé pour les appareils mobiles.
                    Veuillez utiliser un ordinateur pour une meilleure expérience.
                </p>
                <img src="/logo_tn.png" alt="Terra Numerica Logo" className="mobile-warning-logo" />
            </div>
        </div>
    );
};

export default MobileWarning; 