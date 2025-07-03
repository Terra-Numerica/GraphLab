import React from 'react';
import '../../styles/common/ValidationPopup.css';

const icons = {
    warning: '⚠️',
    error: '❌',
    success: '✅'
}

export const ValidationPopup = ({ type, title, message, onClose }) => (
    <div className="validation-popup-overlay">
        <div className={`validation-popup ${type}`}>
            <div className="validation-popup-header">
                <span className="validation-popup-icon">{icons[type]}</span>
                <h3>{title}</h3>
            </div>
            <div className="validation-popup-content">
                {message.split('\n').map((line, idx) => (
                    <p key={idx} style={{ margin: 0 }}>{line}</p>
                ))}
            </div>
            <div className="validation-popup-footer">
                <button onClick={onClose} className="validation-popup-button">
                    OK
                </button>
            </div>
        </div>
    </div>
);