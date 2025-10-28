import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Type, Tool, LiveServerMessage, Modality, Blob as GenAIBlob, FunctionDeclaration } from '@google/genai';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { PreventionPlan } from '../types';
import SEOMeta from '../components/SEOMeta';
import { buildPreventionPlanSystemInstruction, getScopedKey, getUserContext } from '../utils';
import VoiceVisualizer from '../components/VoiceVisualizer';
import { ai } from '../services/geminiService';
import Logo from '../components/Logo';

// --- Audio Helper Functions ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
function createBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}
// --- End Audio Helpers ---

const updatePlanFunctionDeclaration: FunctionDeclaration = {
    name: 'updatePlan',
    description: 'Updates, adds, or overwrites sections of the user\'s relapse prevention plan. Can handle multiple updates at once from a single user message.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            triggers: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of new triggers to add to the plan.' },
            copingStrategies: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of new coping strategies to add to the plan.' },
            supportNetwork: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, contactInfo: { type: Type.STRING, description: "Phone number, email, or their relationship to the user." } } }, description: 'A list of new support contacts to add to the plan.' },
            myWhy: { type: Type.STRING, description: 'The user\'s core motivation for recovery. This will overwrite any previous value.' }
        },
    }
};
const tools: Tool[] = [{ functionDeclarations: [updatePlanFunctionDeclaration] }];

type SessionState = 'idle' | 'connecting' | 'live' | 'speaking' | 'error' | 'ended';
interface TranscriptMessage {
    speaker: 'user' | 'model';
    text: string;
    isFinal?: boolean;
}

const PreventionPlanPage: React.FC = () => {
    const { t } = useLocalization();
    const { getScopedKey } = useAuth();
    const navigate = useNavigate();
    
    const userContextAvailable = !!getUserContext();

    const [plan, setPlan] = useState<PreventionPlan>({ triggers: [], copingStrategies: [], supportNetwork: [], myWhy: '' });
    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newlyAdded, setNewlyAdded] = useState<Set<string>>(new Set());

    const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioPlaybackSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const animationFrameRef = useRef<number | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        const storedPlanJSON = localStorage.getItem(getScopedKey('prevention-plan'));
        const initialPlan = { triggers: [], copingStrategies: [], supportNetwork: [], myWhy: '' };
        if(storedPlanJSON) {
            try {
                const storedPlan = JSON.parse(storedPlanJSON);
                setPlan({ ...initialPlan, ...storedPlan });
            } catch (e) {
                console.error("Failed to parse stored prevention plan:", e);
                setPlan(initialPlan);
            }
        } else {
            setPlan(initialPlan);
        }
    }, [getScopedKey]);
    
    useEffect(() => {
        // This effect auto-saves the plan to localStorage whenever it's updated,
        // either by the AI or manual deletion. It skips the initial render
        // to avoid overwriting a stored plan with the initial empty state.
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            localStorage.setItem(getScopedKey('prevention-plan'), JSON.stringify(plan));
        }
    }, [plan, getScopedKey]);


    useEffect(() => {
        if (newlyAdded.size > 0) {
            const timer = setTimeout(() => setNewlyAdded(new Set()), 2500);
            return () => clearTimeout(timer);
        }
    }, [newlyAdded]);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const cleanup = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        analyserRef.current?.disconnect();
        mediaStreamSourceRef.current?.mediaStream.getTracks().forEach(track => track.stop());

        inputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current?.close().catch(console.error);
        
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
        analyserRef.current = null;
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        sessionPromiseRef.current = null;
        
        audioPlaybackSourcesRef.current.forEach(source => source.stop());
        audioPlaybackSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        setIsUserSpeaking(false);
    };

    const handleStopSession = () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close()).catch(console.error);
        }
        cleanup();
        setSessionState('ended');
    };
    
    useEffect(() => {
        return () => { handleStopSession(); };
    }, []);

    const visualize = () => {
        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteTimeDomainData(dataArray);
            setAudioData(dataArray);
            setIsUserSpeaking(dataArray.some(v => v > 130));
        }
        animationFrameRef.current = requestAnimationFrame(visualize);
    };

    const handleStartSession = async () => {
        setError(null);
        setTranscript([]);
        setSessionState('connecting');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const systemInstruction = buildPreventionPlanSystemInstruction(t);
            if (!systemInstruction) throw new Error("Could not build system instruction.");

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                    systemInstruction,
                    tools,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        const inputCtx = inputAudioContextRef.current!;
                        mediaStreamSourceRef.current = inputCtx.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputCtx.createScriptProcessor(4096, 1, 1);
                        analyserRef.current = inputCtx.createAnalyser();
                        
                        scriptProcessorRef.current.onaudioprocess = (e) => {
                            sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: createBlob(e.inputBuffer.getChannelData(0)) }));
                        };
                        
                        mediaStreamSourceRef.current.connect(analyserRef.current);
                        analyserRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputCtx.destination);
                        
                        setSessionState('live');
                        visualize();
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        if (msg.serverContent) setSessionState('speaking');

                        const isFinal = !!msg.serverContent?.turnComplete;

                        if (msg.serverContent?.inputTranscription) {
                            const { text } = msg.serverContent.inputTranscription;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.speaker === 'user' && !last.isFinal) return [...prev.slice(0, -1), { ...last, text: last.text + text, isFinal }];
                                return [...prev, { speaker: 'user', text, isFinal }];
                            });
                        }

                        if (msg.serverContent?.outputTranscription) {
                            const { text } = msg.serverContent.outputTranscription;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.speaker === 'model' && !last.isFinal) return [...prev.slice(0, -1), { ...last, text: last.text + text, isFinal }];
                                return [...prev, { speaker: 'model', text, isFinal }];
                            });
                        }

                        const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            try {
                                const outputCtx = outputAudioContextRef.current;
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                                const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                                const source = outputCtx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputCtx.destination);
                                source.addEventListener('ended', () => {
                                    audioPlaybackSourcesRef.current.delete(source);
                                    if (audioPlaybackSourcesRef.current.size === 0) setSessionState('live');
                                });
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                audioPlaybackSourcesRef.current.add(source);
                            } catch(audioError) {
                                console.error("Error decoding or playing audio:", audioError);
                            }
                        } else if (msg.serverContent && !base64Audio) {
                             if (audioPlaybackSourcesRef.current.size === 0) setSessionState('live');
                        }
                        
                        if (msg.toolCall?.functionCalls) {
                            for (const call of msg.toolCall.functionCalls) {
                                if (call.name === 'updatePlan') {
                                    const args = call.args as Partial<PreventionPlan>;
                                    const newItems = new Set<string>();

                                    if (args.myWhy) newItems.add('myWhy-main');
                                    if (Array.isArray(args.triggers)) args.triggers.forEach((t: string) => newItems.add(`triggers-${t}`));
                                    if (Array.isArray(args.copingStrategies)) args.copingStrategies.forEach((s: string) => newItems.add(`copingStrategies-${s}`));
                                    if (Array.isArray(args.supportNetwork)) args.supportNetwork.forEach((c: { name: string }) => c.name && newItems.add(`supportNetwork-${c.name}`));

                                    setNewlyAdded(newItems);

                                    setPlan(p => ({
                                        ...p,
                                        myWhy: args.myWhy || p.myWhy,
                                        triggers: Array.isArray(args.triggers) ? [...new Set([...p.triggers, ...args.triggers])] : p.triggers,
                                        copingStrategies: Array.isArray(args.copingStrategies) ? [...new Set([...p.copingStrategies, ...args.copingStrategies])] : p.copingStrategies,
                                        supportNetwork: Array.isArray(args.supportNetwork) ? [
                                            ...p.supportNetwork,
                                            ...args.supportNetwork.filter(nc => nc && nc.name && !p.supportNetwork.some(ec => ec.name.toLowerCase() === nc.name.toLowerCase()))
                                        ] : p.supportNetwork
                                    }));
                                    
                                    sessionPromiseRef.current?.then(session => session.sendToolResponse({ functionResponses: [{id: call.id, name: call.name, response: { result: 'Plan updated.' }}]}));
                                }
                            }
                        }
                    },
                    onerror: (e) => { setError(t('live_talk.status.error')); setSessionState('error'); cleanup(); },
                    onclose: () => { setSessionState('ended'); cleanup(); }
                }
            });
        } catch (err) {
            console.error(err);
            setError(t('live_talk.mic_permission'));
            setSessionState('error');
        }
    };

    const handleSavePlan = () => {
        setIsSaving(true);
        // localStorage is already up-to-date due to the auto-save useEffect.
        // This button is now for user confirmation and navigation.
        setTimeout(() => {
            setIsSaving(false);
            navigate('/dashboard');
        }, 1500);
    };

    const handleDeleteItem = (section: keyof Omit<PreventionPlan, 'myWhy'>, index: number) => {
        setPlan(prev => ({...prev, [section]: prev[section].filter((_, i) => i !== index)}));
    };
    
    if (!userContextAvailable) {
        return (
            <div className="py-12 flex-grow flex items-center justify-center">
                <div className="text-center p-8 bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft-lg max-w-lg mx-auto">
                    <div className="flex justify-center mb-4"><Logo /></div>
                    <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('prevention_plan_page.title')}</h2>
                    <p className="text-base-600 dark:text-base-300 mb-6">{t('prevention_plan_page.no_program_error')}</p>
                    <a href="/#/programs" className="inline-block bg-primary-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors">
                        {t('prevention_plan_page.select_program_link')}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEOMeta title={t('seo.prevention_plan.title')} description={t('seo.prevention_plan.description')} noIndex={true}/>
            <div className="py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('prevention_plan_page.title')}</h1>
                        <p className="mt-3 text-lg text-base-600 dark:text-base-300 max-w-3xl mx-auto">{t('prevention_plan_page.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft flex flex-col max-h-[75vh] lg:sticky top-24">
                            {sessionState === 'idle' || sessionState === 'ended' || sessionState === 'error' ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <h2 className="text-xl font-bold text-primary-500 mb-4">{t('live_talk.title')}</h2>
                                    <p className="text-base-600 dark:text-base-300 mb-6">{sessionState === 'ended' ? "Session ended. You can review your plan and save it." : "Let's build your plan together through conversation."}</p>
                                    <button onClick={handleStartSession} className="bg-primary-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-600 transition-colors">Start Session</button>
                                    {error && <p className="text-warning-500 text-sm mt-4">{error}</p>}
                                </div>
                            ) : (
                                <>
                                    <div className="flex-grow p-4 overflow-y-auto">
                                        <div className="space-y-4">
                                            {transcript.map((msg, i) => (
                                                <div key={i}>
                                                    <p className={`font-bold ${msg.speaker === 'user' ? 'text-primary-600 dark:text-primary-400' : 'text-base-800 dark:text-base-200'}`}>{msg.speaker === 'user' ? t('live_talk.user') : t('live_talk.model')}</p>
                                                    <p className={`text-base-700 dark:text-base-300 ${!msg.isFinal && 'opacity-60'}`}>{msg.text}</p>
                                                </div>
                                            ))}
                                            <div ref={transcriptEndRef} />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/80 dark:bg-base-800/80 border-t border-base-200 dark:border-base-700 flex flex-col items-center">
                                        <VoiceVisualizer audioData={audioData} isUserSpeaking={isUserSpeaking} isAIThinking={sessionState === 'speaking'} />
                                        <button onClick={handleStopSession} className="mt-4 bg-warning-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-warning-600">End Session</button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-2xl shadow-soft">
                            <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 text-center mb-6">{t('prevention_plan_page.plan_title')}</h2>
                            <div className="space-y-6">
                                <PlanSection title={t('prevention_plan_page.my_why_title')} items={[plan.myWhy]} newlyAdded={newlyAdded} itemType="myWhy-main" />
                                <PlanSection title={t('prevention_plan_page.triggers_title')} items={plan.triggers} onDelete={(i) => handleDeleteItem('triggers', i)} newlyAdded={newlyAdded} itemType="triggers" />
                                <PlanSection title={t('prevention_plan_page.coping_title')} items={plan.copingStrategies} onDelete={(i) => handleDeleteItem('copingStrategies', i)} newlyAdded={newlyAdded} itemType="copingStrategies" />
                                <PlanSection title={t('prevention_plan_page.support_title')} items={plan.supportNetwork.map(c => `${c.name} (${c.contactInfo})`)} onDelete={(i) => handleDeleteItem('supportNetwork', i)} newlyAdded={newlyAdded} itemType="supportNetwork" />
                            </div>
                            <button onClick={handleSavePlan} disabled={isSaving} className="w-full mt-8 bg-accent-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-600 transition-colors disabled:bg-accent-300">
                                {isSaving ? t('prevention_plan_page.plan_saved') : t('prevention_plan_page.save_button')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const PlanSection: React.FC<{title: string, items: string[], onDelete?: (index: number) => void, newlyAdded: Set<string>, itemType: string}> = ({ title, items, onDelete, newlyAdded, itemType }) => {
    const { t } = useLocalization();
    const isWhySection = itemType.startsWith('myWhy');

    return (
        <div>
            <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400 mb-2">{title}</h3>
            <div className="bg-base-50/50 dark:bg-base-700/30 p-4 rounded-lg min-h-[60px]">
                {items.length === 0 || (isWhySection && !items[0]) ? (
                    <p className="text-base-500 text-sm italic">Aman AI will help you fill this section.</p>
                ) : (
                    <ul className={isWhySection ? '' : "flex flex-wrap gap-2"}>
                        {items.map((item, i) => (
                            <li key={i} className={`flex items-center rounded-full text-sm font-medium transition-all duration-500 ${isWhySection ? 'italic text-base-700 dark:text-base-300' : 'bg-base-200 dark:bg-base-600 text-base-800 dark:text-base-200 px-3 py-1'} ${newlyAdded.has(`${itemType}-${item}`) || (isWhySection && newlyAdded.has(itemType)) ? 'ring-2 ring-accent-400' : ''}`}>
                                {isWhySection ? `"${item}"` : item}
                                {onDelete && !isWhySection && (
                                    <button onClick={() => onDelete(i)} className="ml-2 -mr-1 p-0.5 rounded-full hover:bg-base-300 dark:hover:bg-base-500" aria-label={t('prevention_plan_page.delete_item_aria')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PreventionPlanPage;
