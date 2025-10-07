import React from 'react';
import '../../styles/common/ConfirmationPopup.css';

interface ConfirmationPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div
            className="confirmation-popup-overlay"
            onContextMenu={e => e.preventDefault()}
        >
            <div className="confirmation-popup">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirmation-popup-buttons">
                    <button className="confirmation-popup-cancel" onClick={onClose}>
                        Annuler
                    </button>
                    <button className="confirmation-popup-confirm" onClick={onConfirm}>
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup; 