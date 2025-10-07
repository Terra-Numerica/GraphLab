import '../../styles/common/RulesPopup.css';

interface RulesPopupProps {
    title?: string;
    children: React.ReactNode;
    onClose: () => void;
}

const RulesPopup: React.FC<RulesPopupProps> = ({ title, children, onClose }) => (
    <div className="rules-popup-overlay">
        <div className="rules-popup">
            <button className="rules-popup-close" onClick={onClose}>&times;</button>
            {title && <h3 className="rules-popup-title">{title}</h3>}
            <div className="rules-popup-content">{children}</div>
        </div>
    </div>
);

export default RulesPopup; 