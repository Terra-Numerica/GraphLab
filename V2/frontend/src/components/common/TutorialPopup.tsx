import React, { useState } from 'react';
import { TutorialStep } from '../../types';
import '../../styles/common/TutorialPopup.css';

interface TutorialPopupProps {
    onClose: () => void;
    onComplete: (dontShowAgain: boolean) => void;
    steps: TutorialStep[];
}

const TutorialPopup: React.FC<TutorialPopupProps> = ({ onClose, onComplete, steps }) => {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete(dontShowAgain);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const isLastStep = currentStep === steps.length - 1;

    return (
        <div className="tutorial-popup-overlay">
            <div className="tutorial-popup">
                <button className="tutorial-popup-close" onClick={onClose}>&times;</button>
                <h3 className="tutorial-popup-title">
                    {steps[currentStep].title}
                    {steps[currentStep].status && (
                        <span className={`tutorial-status tutorial-status-${steps[currentStep].status}`}>
                            {steps[currentStep].status === 'yes' && '✓'}
                            {steps[currentStep].status === 'no' && '✗'}
                        </span>
                    )}
                </h3>
                <div className="tutorial-popup-content">
                    <img 
                        src={steps[currentStep].image} 
                        alt={steps[currentStep].title}
                        className="tutorial-image"
                    />
                    <p className="tutorial-description" dangerouslySetInnerHTML={{ __html: steps[currentStep].description || '' }}></p>
                </div>
                <div className="tutorial-popup-footer">
                    {isLastStep && (
                        <div className="tutorial-checkbox">
                            <input
                                type="checkbox"
                                id="dontShowAgain"
                                checked={dontShowAgain}
                                onChange={(e) => setDontShowAgain(e.target.checked)}
                            />
                            <label htmlFor="dontShowAgain">Ne plus voir la prochaine fois</label>
                        </div>
                    )}
                    <div className="tutorial-buttons">
                        {currentStep > 0 && (
                            <button 
                                className="tutorial-button tutorial-button-previous"
                                onClick={handlePrevious}
                            >
                                Précédent
                            </button>
                        )}
                        <button 
                            className="tutorial-button tutorial-button-next"
                            onClick={handleNext}
                        >
                            {isLastStep ? "J'ai compris" : "Suivant"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialPopup; 