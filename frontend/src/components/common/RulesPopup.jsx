import React from 'react';

const RulesPopup = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/35">
        <div className="bg-white rounded-xl shadow-2xl p-9 md:p-10 max-w-[1000px] w-[95vw] relative text-lg text-gray-800" style={{ animation: 'popup-fade-in 0.2s ease-out' }}>
            <button 
                className="absolute top-3 right-4 bg-transparent border-none text-2xl text-gray-500 cursor-pointer transition-colors duration-150 hover:text-red focus:outline-none focus:ring-2 focus:ring-blue/40 rounded" 
                onClick={onClose}
                aria-label="Fermer"
            >
                &times;
            </button>
            {title && (
                <h3 className="mt-0 mb-3.5 text-xl text-blue font-bold">
                    {title}
                </h3>
            )}
            <div className="[&_h3]:mt-0 [&_h3]:mb-2.5 [&_h3]:text-lg [&_h3]:text-blue [&_h3]:font-semibold [&_ul]:mt-0 [&_ul]:mb-4.5 [&_ul]:pl-[22px]">
                {children}
            </div>
        </div>
    </div>
);

export default RulesPopup; 