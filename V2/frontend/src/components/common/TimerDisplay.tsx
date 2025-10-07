import React from 'react';
import '../../styles/common/TimerDisplay.css';

interface TimerDisplayProps {
    time: number;
    formatTime: (seconds: number) => string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, formatTime }) => {
    return <div className="mode-timer">Temps: {formatTime(time)}</div>;
};

export default TimerDisplay; 