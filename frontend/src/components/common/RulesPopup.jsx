import '../../styles/common/RulesPopup.css';

export const RulesPopup = ({ title, children, onClose }) => (
    <div className="rules-popup-overlay">
        <div className="rules-popup">
            <button className="rules-popup-close" onClick={onClose}>&times;</button>
            {title && <h1 className="rules-popup-title">{title}</h1>}
            <div className="rules-popup-content">{children}</div>
        </div>
    </div>
);