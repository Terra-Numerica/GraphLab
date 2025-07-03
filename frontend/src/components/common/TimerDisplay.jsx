export const TimerDisplay = memo(({ time, formatTime }) => {
    return <div className="mode-timer">Temps: {formatTime(time)}</div>;
});