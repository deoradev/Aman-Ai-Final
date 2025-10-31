

import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useConnectivity } from '../hooks/useConnectivity';
// FIX: ToolkitType is defined in '../types' and should be imported from there directly.
import { generateToolkitExercise, generateSpeech } from '../services/geminiService';
import SEOMeta from '../components/SEOMeta';
import SimpleMarkdownRenderer from '../components/SimpleMarkdownRenderer';
import { EchoAffirmation, ToolkitType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { playAndReturnAudio } from '../utils';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface GeneratorCardProps {
    type: ToolkitType;
    title: string;
    description: string;
    placeholder?: string;
    buttonText: string;
}

const GeneratorCard: React.FC<GeneratorCardProps> = ({ type, title, description, placeholder, buttonText }) => {
    const { t } = useLocalization();
    const { isOnline } = useConnectivity();
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [result, setResult] = useState('');
    
    const hasInputField = type !== 'gratitude';

    const handleSubmit = async () => {
        if (hasInputField && !userInput.trim()) return;
        if (!isOnline) {
            setResult(t('offline.feature_unavailable'));
            setStatus('error');
            return;
        }
        setStatus('loading');
        setResult('');

        try {
            const response = await generateToolkitExercise(type, userInput);
            setResult(response);
            setStatus('success');
        } catch (error) {
            console.error(error);
            setResult(t('toolkit.error'));
            setStatus('error');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    return (
        <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft overflow-hidden border border-base-200 dark:border-base-700">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">{title}</h2>
                <p className="text-base-600 dark:text-base-300 mb-4">{description}</p>
                {hasInputField && (
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={placeholder}
                        onKeyPress={handleKeyPress}
                        rows={2}
                        className="w-full p-2 border border-base-300 dark:border-base-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-base-700/50 text-base-800 dark:text-white mb-4"
                        disabled={!isOnline}
                    />
                )}
                <button
                    onClick={handleSubmit}
                    disabled={status === 'loading' || !isOnline || (hasInputField && !userInput.trim())}
                    className="w-full bg-base-800 text-white dark:bg-base-200 dark:text-base-900 font-bold py-3 px-6 rounded-lg hover:bg-base-700 dark:hover:bg-base-300 transition-colors disabled:bg-base-400 dark:disabled:bg-base-600 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {status === 'loading' ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('toolkit.generating')}
                        </>
                    ) : (
                        buttonText
                    )}
                </button>
            </div>
            {(status === 'success' || status === 'error') && (
                 <div className="p-6 bg-base-50/50 dark:bg-base-900/30 border-t border-base-200 dark:border-base-700">
                    <div className={status === 'error' ? 'text-warning-500' : ''}>
                        <SimpleMarkdownRenderer content={result} />
                    </div>
                 </div>
            )}
        </div>
    );
};

const AudioGeneratorCard: React.FC<{
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
    voice: string;
}> = ({ title, description, placeholder, buttonText, voice }) => {
    const { t } = useLocalization();
    const { isOnline } = useConnectivity();
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'generating_script' | 'generating_audio' | 'playing' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    // FIX: Changed ref type from HTMLAudioElement to AudioBufferSourceNode to match the `playAndReturnAudio` utility function.
    const currentAudioRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        return () => {
            // FIX: Use .stop() for AudioBufferSourceNode.
            currentAudioRef.current?.stop();
        };
    }, []);

    const handleStop = () => {
        if (currentAudioRef.current) {
            // FIX: Use .stop() for AudioBufferSourceNode instead of .pause().
            currentAudioRef.current.stop();
            // The onEnded listener in playAndReturnAudio will handle the rest.
        }
    };

    const handleGenerate = async () => {
        if (!userInput.trim() || !isOnline) return;
        setStatus('generating_script');
        setError(null);
        
        try {
            const script = await generateToolkitExercise('future_self', userInput);
            
            setStatus('generating_audio');
            const audioDataB64 = await generateSpeech(script, voice);
            
            setStatus('playing');
            // FIX: Correctly `await` the async `playAndReturnAudio` function.
            currentAudioRef.current = await playAndReturnAudio(audioDataB64, () => {
                setStatus('idle');
                currentAudioRef.current = null;
            });

        } catch (err) {
            console.error(err);
            setError(t('toolkit.future_self_visualization.error'));
            setStatus('error');
            setTimeout(() => {
                setStatus('idle');
                setError(null);
            }, 4000);
        }
    };
    
    const getButtonContent = () => {
        const spinner = <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
        const pauseIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
        
        switch(status) {
            case 'generating_script': return <>{spinner} {t('toolkit.future_self_visualization.generating_script')}</>;
            case 'generating_audio': return <>{spinner} {t('toolkit.future_self_visualization.generating_audio')}</>;
            case 'playing': return <>{pauseIcon} {t('toolkit.future_self_visualization.playing')}</>;
            default: return buttonText;
        }
    }

    return (
        <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft overflow-hidden border border-base-200 dark:border-base-700">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">{title}</h2>
                <p className="text-base-600 dark:text-base-300 mb-4">{description}</p>
                 <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={placeholder}
                    rows={2}
                    className="w-full p-2 border border-base-300 dark:border-base-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-base-700/50 text-base-800 dark:text-white mb-4"
                    disabled={!isOnline || (status !== 'idle' && status !== 'error')}
                />
                 <button
                    onClick={status === 'playing' ? handleStop : handleGenerate}
                    disabled={!isOnline || (status !== 'idle' && status !== 'playing' && status !== 'error') || (status === 'idle' && !userInput.trim())}
                    className={`w-full font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center ${status === 'playing' ? 'bg-warning-500 text-white hover:bg-warning-600' : 'bg-base-800 text-white dark:bg-base-200 dark:text-base-900 hover:bg-base-700 dark:hover:bg-base-300 disabled:bg-base-400 dark:disabled:bg-base-600 disabled:cursor-not-allowed'}`}
                >
                   {getButtonContent()}
                </button>
                {error && <p className="text-warning-500 text-sm mt-2 text-center">{error}</p>}
            </div>
        </div>
    );
};


const EchoesOfStrength: React.FC = () => {
    const { t } = useLocalization();
    const { isOnline } = useConnectivity();
    const { getScopedKey } = useAuth();
    const [affirmations, setAffirmations] = useState<EchoAffirmation[]>([]);
    const [newText, setNewText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('Kore');
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState('');
    const [playingId, setPlayingId] = useState<number | null>(null);

    // FIX: Changed ref type from HTMLAudioElement to AudioBufferSourceNode.
    const currentAudioRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(getScopedKey('echo-affirmations'));
            if (stored) {
                setAffirmations(JSON.parse(stored));
            }
        } catch (e) { console.error("Could not load affirmations.", e); }
        
        return () => {
            // FIX: Use .stop() for AudioBufferSourceNode.
            currentAudioRef.current?.stop();
            currentAudioRef.current = null;
        }
    }, [getScopedKey]);

    const handleGenerate = async () => {
        if (!newText.trim() || !isOnline) return;
        setStatus('loading');
        setError('');
        try {
            const audioDataB64 = await generateSpeech(newText.trim(), selectedVoice);
            const newAffirmation: EchoAffirmation = {
                id: Date.now(),
                text: newText.trim(),
                voice: selectedVoice,
                audioDataB64,
            };
            const updatedAffirmations = [newAffirmation, ...affirmations];
            setAffirmations(updatedAffirmations);
            localStorage.setItem(getScopedKey('echo-affirmations'), JSON.stringify(updatedAffirmations));
            setNewText('');
            setStatus('success');
        } catch (err) {
            setError(t('toolkit.echoes_of_strength.error'));
            setStatus('error');
        } finally {
            if (status !== 'success') setStatus('idle');
        }
    };
    
    const handlePlay = async (affirmation: EchoAffirmation) => {
        if (playingId === affirmation.id) {
            // FIX: Use .stop() for AudioBufferSourceNode.
            currentAudioRef.current?.stop();
            currentAudioRef.current = null;
            setPlayingId(null);
            return;
        }

        if (currentAudioRef.current) {
            // FIX: Use .stop() to halt the currently playing audio.
            currentAudioRef.current.stop();
        }

        setPlayingId(affirmation.id);
        // FIX: Correctly `await` the async `playAndReturnAudio` function.
        currentAudioRef.current = await playAndReturnAudio(affirmation.audioDataB64, () => {
            setPlayingId(null);
            currentAudioRef.current = null;
        });
    };

    const voices = ['Kore', 'Puck', 'Zephyr', 'Fenrir'];

    return (
        <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft overflow-hidden border border-base-200 dark:border-base-700">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">{t('toolkit.echoes_of_strength.title')}</h2>
                <p className="text-base-600 dark:text-base-300 mb-4">{t('toolkit.echoes_of_strength.description')}</p>
                <textarea
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder={t('toolkit.echoes_of_strength.placeholder')}
                    rows={2}
                    className="w-full p-2 border border-base-300 dark:border-base-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-base-700/50 text-base-800 dark:text-white mb-4"
                    disabled={!isOnline || status === 'loading'}
                />
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-grow">
                         <label htmlFor="voice-select" className="sr-only">{t('toolkit.echoes_of_strength.voice_label')}</label>
                         <select 
                            id="voice-select"
                            value={selectedVoice} 
                            onChange={e => setSelectedVoice(e.target.value)}
                            className="w-full p-3 border border-base-300 dark:border-base-600 rounded-md bg-white/50 dark:bg-base-700/50"
                         >
                            {voices.map(v => <option key={v} value={v}>{t(`toolkit.echoes_of_strength.voice_names.${v}`)}</option>)}
                         </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={status === 'loading' || !isOnline || !newText.trim()}
                        className="sm:w-auto bg-base-800 text-white dark:bg-base-200 dark:text-base-900 font-bold py-3 px-6 rounded-lg hover:bg-base-700 dark:hover:bg-base-300 transition-colors disabled:bg-base-400 dark:disabled:bg-base-600 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {status === 'loading' ? (
                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : ' '}{status === 'loading' ? t('toolkit.echoes_of_strength.generating') : t('toolkit.echoes_of_strength.generate_button')}
                    </button>
                </div>
                 {error && <p className="text-warning-500 text-sm mt-2">{error}</p>}
            </div>
            
            <div className="p-6 bg-base-50/50 dark:bg-base-900/30 border-t border-base-200 dark:border-base-700">
                <h3 className="text-lg font-bold text-primary-500 mb-4">{t('toolkit.echoes_of_strength.history_title')}</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {affirmations.length > 0 ? affirmations.map(aff => (
                        <div key={aff.id} className={`flex items-center justify-between gap-3 bg-white dark:bg-base-800/50 p-3 rounded-lg transition-all ${playingId === aff.id ? 'ring-2 ring-primary-400' : ''}`}>
                            <p className="text-sm italic text-base-700 dark:text-base-300 flex-grow">"{aff.text}"</p>
                            <button onClick={() => handlePlay(aff)} className={`flex-shrink-0 p-2 rounded-full text-white transition-colors hover:bg-primary-600 ${playingId === aff.id ? 'bg-primary-600' : 'bg-primary-500'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    {playingId === aff.id ? (
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    ) : (
                                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    )) : (
                        <p className="text-sm text-base-500 dark:text-base-400 text-center py-4">{t('toolkit.echoes_of_strength.empty_history')}</p>
                    )}
                </div>
            </div>

        </div>
    );
};


const BreathingExercise: React.FC = () => {
    const { t } = useLocalization();
    const [isActive, setIsActive] = useState(false);
    const [text, setText] = useState('');
    const [animationClass, setAnimationClass] = useState('');
    
    const circleRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        let timer: number;
        if (isActive) {
            const cycle = () => {
                setText(t('toolkit.breathing.inhale'));
                setAnimationClass('inhale');
                timer = window.setTimeout(() => {
                    setText(t('toolkit.breathing.hold'));
                    setAnimationClass('hold');
                    timer = window.setTimeout(() => {
                        setText(t('toolkit.breathing.exhale'));
                        setAnimationClass('exhale');
                    }, 7000); // Hold for 7s
                }, 4000); // Inhale for 4s
            };

            cycle(); // Start first cycle immediately
            const interval = setInterval(cycle, 19000); // 4 in + 7 hold + 8 out = 19s total
            
            return () => {
                clearInterval(interval);
                clearTimeout(timer);
            };
        } else {
            setText('');
            setAnimationClass('');
        }
    }, [isActive, t]);

    useEffect(() => {
      if (circleRef.current) {
        const computedStyle = getComputedStyle(document.body);
        const primaryColor = `rgb(${computedStyle.getPropertyValue('--color-primary').trim()})`;
        circleRef.current.style.backgroundColor = primaryColor;
      }
    }, [isActive]);
    
    return (
        <div className="flex flex-col items-center justify-center p-6 bg-base-50/50 dark:bg-base-900/30 border-t border-base-200 dark:border-base-700">
            <div className="relative w-48 h-48 flex items-center justify-center">
                <div ref={circleRef} className={`breathing-circle ${animationClass}`}></div>
                <span className="absolute text-xl font-semibold text-white dark:text-base-900 drop-shadow-md">
                    {isActive && text}
                </span>
            </div>
             <button
                onClick={() => setIsActive(!isActive)}
                className="mt-6 w-full sm:w-auto bg-base-800 text-white dark:bg-base-200 dark:text-base-900 font-bold py-3 px-8 rounded-lg hover:bg-base-700 dark:hover:bg-base-300 transition-colors"
            >
                {isActive ? t('toolkit.breathing.stop') : t('toolkit.breathing.start')}
            </button>
            <style>{`
                .breathing-circle {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    position: absolute;
                    transition-property: transform;
                }
                .breathing-circle.inhale { transform: scale(1); transition-duration: 4s; transition-timing-function: ease-in-out; }
                .breathing-circle.hold { transform: scale(1); transition-duration: 7s; }
                .breathing-circle.exhale { transform: scale(0.5); transition-duration: 8s; transition-timing-function: ease-in-out; }
            `}</style>
        </div>
    );
}

const InteractiveToolCard: React.FC<{title: string, description: string, children: React.ReactNode}> = ({ title, description, children }) => {
    return (
        <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft overflow-hidden border border-base-200 dark:border-base-700">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">{title}</h2>
                <p className="text-base-600 dark:text-base-300">{description}</p>
            </div>
            {children}
        </div>
    );
};

const ToolkitPage: React.FC = () => {
    const { t } = useLocalization();
    
    return (
        <>
            <SEOMeta
                title={t('seo.toolkit.title')}
                description={t('seo.toolkit.description')}
                noIndex={true}
            />
            <div className="py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('toolkit.title')}</h1>
                        <p className="mt-3 text-lg text-base-600 dark:text-base-300 max-w-3xl mx-auto">{t('toolkit.subtitle')}</p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-8">
                        <AudioGeneratorCard
                            title={t('toolkit.future_self_visualization.title')}
                            description={t('toolkit.future_self_visualization.description')}
                            placeholder={t('toolkit.future_self_visualization.placeholder')}
                            buttonText={t('toolkit.future_self_visualization.button')}
                            voice="Zephyr"
                        />
                        <GeneratorCard
                            type="nutrition"
                            title={t('toolkit.nutrition_navigator.title')}
                            description={t('toolkit.nutrition_navigator.description')}
                            placeholder={t('toolkit.nutrition_navigator.placeholder')}
                            buttonText={t('toolkit.nutrition_navigator.button')}
                        />
                        <EchoesOfStrength />
                        <InteractiveToolCard
                            title={t('toolkit.breathing.title')}
                            description={t('toolkit.breathing.description')}
                        >
                            <BreathingExercise />
                        </InteractiveToolCard>
                        <GeneratorCard
                            type="meditation"
                            title={t('toolkit.meditation.title')}
                            description={t('toolkit.meditation.description')}
                            placeholder={t('toolkit.meditation.placeholder')}
                            buttonText={t('toolkit.meditation.button')}
                        />
                        <GeneratorCard
                            type="cbt"
                            title={t('toolkit.cbt.title')}
                            description={t('toolkit.cbt.description')}
                            placeholder={t('toolkit.cbt.placeholder')}
                            buttonText={t('toolkit.cbt.button')}
                        />
                        <GeneratorCard
                            type="gratitude"
                            title={t('toolkit.gratitude.title')}
                            description={t('toolkit.gratitude.description')}
                            buttonText={t('toolkit.gratitude.button')}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ToolkitPage;