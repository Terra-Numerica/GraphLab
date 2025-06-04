// Imports
import { useNavigate } from 'react-router-dom';

import '../../../styles/pages/RailwayMaze/Main.css';

const Main = () => {
    const navigate = useNavigate();
    const handleButtonPress = () => {
        navigate('/railway-maze/penrose');
    };

    return (
        <div className="main-container">
            <div className="explanation-section">
                <h2>Le problème du "Railway-Maze"</h2>
                <div className="explanation-text">
                    <p>
                        P1
                    </p>
                    <p>
                        P2
                    </p>
                </div>
                <button className="resolve-button" onClick={handleButtonPress}>
                    Essayer de résoudre
                </button>
            </div>
        </div>
    )
};

export default Main;