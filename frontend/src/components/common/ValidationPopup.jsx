import React from 'react';
import '../../styles/common/ValidationPopup.css';

const ValidationPopup = ({ type, title, message, onClose }) => {
    const getIcon = () => {
        switch (type) {
            case 'warning':
                return '⚠️';
            case 'error':
                return '❌';
            case 'success':
                return '✅';
            default:
                return '';
        }
    };

    return (
        <div className="validation-popup-overlay">
            <div className={`validation-popup ${type}`}>
                <div className="validation-popup-header">
                    <span className="validation-popup-icon">{getIcon()}</span>
                    <h3>{title}</h3>
                </div>
                <div className="validation-popup-content">
                    <p>{message}</p>
                </div>
                <div className="validation-popup-footer">
                    <button onClick={onClose} className="validation-popup-button">
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ValidationPopup; 