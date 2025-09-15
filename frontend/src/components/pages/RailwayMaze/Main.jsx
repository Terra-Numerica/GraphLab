// Imports
import { useNavigate } from 'react-router-dom';

import '../../../styles/pages/RailwayMaze/Main.css';

const RailwayMazeMain = () => {
    const navigate = useNavigate();
    
    const handleButtonPress = () => {
        navigate('/railway-maze/penrose');
    };

    return (
        <div className="railway-maze-container">
            <div className="explanation-section">
                <h2>Le problème du "Labyrinthe Voyageur"</h2>
                <div className="explanation-text">
                    <p>
                        ...
                    </p>
                </div>
                <button className="railway-maze-resolve-button" onClick={handleButtonPress}>
                    Essayer de résoudre
                </button>
            </div>
        </div>
    );
};

export default RailwayMazeMain;
