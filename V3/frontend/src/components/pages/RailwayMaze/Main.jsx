import { useNavigate } from 'react-router-dom';
// ❌ plus besoin : import '../../../styles/pages/RailwayMaze/RailwayMazeStyles.css';

const RailwayMazeMain = () => {
    const navigate = useNavigate();

    const handleButtonPress = () => {
        navigate('/railway-maze/penrose');
    };

    return (
        <div className="w-full bg-gray-100 flex flex-col px-4 sm:px-8 md:px-16 py-12">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow p-6 md:p-8 mx-auto my-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-darkBlue mb-6 text-center">
                    Le problème du &quot;Labyrinthe Voyageur&quot;
                </h2>

                <div className="space-y-5 text-astro text-base md:text-lg leading-relaxed">
                    <p>...</p>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleButtonPress}
                        className="inline-flex items-center justify-center rounded-xl border-2 border-blue text-blue font-semibold px-6 py-3 text-lg hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
                    >
                        Essayer de résoudre
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RailwayMazeMain;