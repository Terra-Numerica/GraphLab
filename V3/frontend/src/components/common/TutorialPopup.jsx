import React, { useEffect, useMemo, useRef, useState } from 'react';

const TutorialPopup = ({ onClose, onComplete, steps }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const isLastStep = currentStep === steps.length - 1;

    const panelRef = useRef(null);
    const nextBtnRef = useRef(null);

    const step = useMemo(() => steps[currentStep] ?? {}, [steps, currentStep]);

    // Fermeture via ESC
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrevious();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [currentStep]);

    // Focus initial sur le bouton principal
    useEffect(() => {
        nextBtnRef.current?.focus();
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((s) => s + 1);
        } else {
            onComplete?.(dontShowAgain);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) setCurrentStep((s) => s - 1);
    };

    // Couleurs pour le badge d'état
    const statusMap = {
        yes: { cls: 'bg-green/15 text-green', symbol: '✓', label: 'Correct' },
        no: { cls: 'bg-red/15 text-red', symbol: '✗', label: 'Incorrect' },
        none: { cls: 'bg-grey text-astro', symbol: '', label: '' },
    };
    const status = statusMap[step.status] || null;

    // Empêche la fermeture quand on clique dans le panneau
    const stop = (e) => e.stopPropagation();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutorial-title"
        >
            <div
                ref={panelRef}
                onClick={stop}
                className="relative w-full max-w-3xl rounded-2xl bg-white p-6 md:p-8 shadow-2xl"
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    aria-label="Fermer le tutoriel"
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-astro/70 hover:bg-gray-100 hover:text-astro focus:outline-none focus:ring-2 focus:ring-blue/40"
                >
                    &times;
                </button>

                {/* Title + status */}
                <h3
                    id="tutorial-title"
                    className="mb-4 flex items-center gap-3 text-2xl font-bold text-darkBlue md:text-3xl"
                >
                    <span>{step.title}</span>
                    {status && (step.status === 'yes' || step.status === 'no') && (
                        <span
                            className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-sm font-semibold ${status.cls}`}
                            aria-label={status.label}
                        >
                            <span className="leading-none">{status.symbol}</span>
                            <span className="hidden sm:inline">{status.label}</span>
                        </span>
                    )}
                </h3>

                {/* Content */}
                <div className="flex flex-col items-start gap-6 md:flex-row">
                    {step.image && (
                        <img
                            src={step.image}
                            alt={step.title}
                            className="w-full max-h-72 rounded-xl border border-grey object-contain shadow md:w-1/2"
                        />
                    )}
                    <div className="w-full md:w-1/2">
                        <p
                            className="text-astro leading-relaxed"
                            // le contenu contient des <br /> déjà
                            dangerouslySetInnerHTML={{ __html: step.description || '' }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-4 sm:flex-row sm:items-center">
                    {/* Checkbox seulement à la dernière étape */}
                    <div className="min-h-9">
                        {isLastStep && (
                            <label className="inline-flex items-center gap-2 text-sm text-astro">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-grey text-blue focus:ring-blue/40"
                                    checked={dontShowAgain}
                                    onChange={(e) => setDontShowAgain(e.target.checked)}
                                />
                                Ne plus voir la prochaine fois
                            </label>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        {currentStep > 0 && (
                            <button
                                type="button"
                                onClick={handlePrevious}
                                className="inline-flex items-center justify-center rounded-xl border border-grey bg-white px-4 py-2 text-sm font-semibold text-darkBlue hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/40"
                            >
                                Précédent
                            </button>
                        )}
                        <button
                            type="button"
                            ref={nextBtnRef}
                            onClick={handleNext}
                            className="inline-flex items-center justify-center rounded-xl bg-blue px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-hover focus:outline-none focus:ring-2 focus:ring-blue/40"
                        >
                            {isLastStep ? "J'ai compris" : 'Suivant'}
                        </button>
                    </div>
                </div>

                {/* Pagination discrète */}
                <div className="mt-4 flex items-center justify-center gap-1">
                    {steps.map((_, i) => (
                        <span
                            key={i}
                            className={`h-1.5 w-6 rounded-full ${i === currentStep ? 'bg-blue' : 'bg-grey'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TutorialPopup;