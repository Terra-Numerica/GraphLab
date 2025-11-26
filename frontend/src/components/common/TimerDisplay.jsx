import React from 'react';

const TimerDisplay = ({ time, formatTime }) => {
    return (
        <div className="text-xl font-semibold text-gray-700 ml-auto bg-gray-50 py-3 px-4 rounded-lg shadow-sm">
            Temps: {formatTime(time)}
        </div>
    );
};

export default TimerDisplay; 