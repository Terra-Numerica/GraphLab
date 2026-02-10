import React from 'react';

const ConfirmationPopup = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50"
            onContextMenu={e => e.preventDefault()}
        >
            <div className="bg-white rounded-lg shadow-lg max-w-[400px] w-[90%] p-5">
                <h3 className="mt-0 text-darkBlue text-lg font-semibold">{title}</h3>
                <p className="mb-5 text-gray-600">{message}</p>
                <div className="flex justify-end gap-2.5">
                    <button 
                        className="px-4 py-2 border-none rounded bg-gray-100 text-darkBlue font-medium cursor-pointer transition-colors duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue/40" 
                        onClick={onClose}
                    >
                        Annuler
                    </button>
                    <button 
                        className="px-4 py-2 border-none rounded bg-red text-white font-medium cursor-pointer transition-colors duration-200 hover:bg-red-hover focus:outline-none focus:ring-2 focus:ring-red/40" 
                        onClick={onConfirm}
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup; 