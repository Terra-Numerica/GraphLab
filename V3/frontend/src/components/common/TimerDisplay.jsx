import React from 'react';
import '../../styles/common/TimerDisplay.css';

const TimerDisplay = ({ time, formatTime }) => {
    return <div className="mode-timer">Temps: {formatTime(time)}</div>;
};

export default TimerDisplay; 