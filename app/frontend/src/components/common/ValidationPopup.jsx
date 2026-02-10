import React from 'react';

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

    const getBorderColor = () => {
        switch (type) {
            case 'warning':
                return 'border-t-4 border-yellow';
            case 'error':
                return 'border-t-4 border-red';
            case 'success':
                return 'border-t-4 border-green';
            default:
                return '';
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
            <div className={`bg-white rounded-lg p-5 w-[400px] shadow-md ${getBorderColor()}`}>
                <div className="flex items-center mb-4">
                    <span className="text-2xl mr-2.5">{getIcon()}</span>
                    <h3 className="m-0 text-xl font-semibold text-darkBlue">{title}</h3>
                </div>
                <div className="mb-5">
                    {message.split('\n').map((line, idx) => (
                        <p key={idx} className="m-0 text-base leading-relaxed text-gray-700">{line}</p>
                    ))}
                </div>
                <div className="flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="bg-blue text-white border-none px-4 py-2 rounded cursor-pointer text-sm transition-colors duration-200 hover:bg-blue-hover focus:outline-none focus:ring-2 focus:ring-blue/40"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ValidationPopup;