import React from 'react';

const MobileWarning = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-darkBlue p-5">
            <div className="bg-white p-8 rounded-[15px] text-center max-w-[90%] shadow-md">
                <h2 className="text-darkBlue mb-4 text-2xl font-semibold">Application non disponible sur mobile</h2>
                <p className="text-astro mb-6 leading-relaxed">
                    Désolé, GraphLab n'est pas encore optimisé pour les appareils mobiles.
                    Veuillez utiliser un ordinateur pour une meilleure expérience.
                </p>
                <img src="/logo_tn.png" alt="Terra Numerica Logo" className="max-w-[150px] h-auto mx-auto" />
            </div>
        </div>
    );
};

export default MobileWarning; 