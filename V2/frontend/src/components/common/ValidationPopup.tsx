import React from 'react';
import '../../styles/common/ValidationPopup.css';

type ValidationType = 'warning' | 'error' | 'success';

interface ValidationPopupProps {
    type: ValidationType;
    title: string;
    message: string;
    onClose: () => void;
}

const ValidationPopup: React.FC<ValidationPopupProps> = ({ type, title, message, onClose }) => {
    const getIcon = (): string => {
        switch (type) {
            case 'warning':
                return '⚠️';
            case 'error':
                return '❌';
            case 'success':
                return '✅';
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
                    {message.split('\n').map((line: string, idx: number) => (
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
};

export default ValidationPopup;