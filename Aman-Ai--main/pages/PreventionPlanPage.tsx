import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LiveSession, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { ai } from '../services/geminiService';
import { buildPreventionPlanSystemInstruction, createBlob, decode, decodeAudioData } from '../utils';
import { PreventionPlan } from '../types';
import SEOMeta from '../components/SEOMeta';

type Status = 'idle' | 'connecting' | 'active' | 'saving' | 'ended' | 'error';

const updatePlanFunctionDeclaration: FunctionDeclaration = {
  name: 'updatePlan',
  parameters: {
    type: Type.OBJECT,
    description: 'Updates one or more sections of the user\'s relapse prevention plan.',
    properties: {
      myWhy: { type: Type.STRING, description: 'The user\'s core motivation for recovery.', nullable: true },
      triggers: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of triggers to add.', nullable: true },
      copingStrategies: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of coping strategies to add.', nullable: true },
      supportNetwork: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            contactInfo: { type: Type.STRING, description: 'Role or contact method, e.g., "Sponsor", "Sister", "Call anytime"' }
          }
        },
        description: 'A list of support people to add.',
        nullable: true
      },
    },
  },
};

const PreventionPlanPage: React.FC = () => {
    const { t } = useLocalization();
    const { getScopedKey } = useAuth();
    const navigate = useNavigate();

    const [plan, setPlan] = useState<PreventionPlan>({ myWhy: '', triggers: [], copingStrategies: [], supportNetwork: [] });
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        const storedPlan = localStorage.getItem(getScopedKey('prevention-plan'));
        if (storedPlan) {
            setPlan(JSON.parse(storedPlan));
        }
    }, [getScopedKey]);

    const cleanup = useCallback(() => {
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        inputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current?.close().catch(console.error);
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;

        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;

        if (audioWorkletNodeRef.current) {
            audioWorkletNodeRef.current.port.onmessage = null;
            audioWorkletNodeRef.current.disconnect();
            audioWorkletNodeRef.current = null;
        }

        setStatus('ended');
    }, []);


    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    const handleStartSession = async () => {
        setStatus('connecting');
        setError(null);
        try {
            const systemInstruction = buildPreventionPlanSystemInstruction(t);
            if (!systemInstruction) throw new Error("Could not build system instruction.");

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            await inputAudioContextRef.current.audioWorklet.addModule('/audioProcessor.js');
            audioWorkletNodeRef.current = new AudioWorkletNode(inputAudioContextRef.current, 'audio-processor');

            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            source.connect(audioWorkletNodeRef.current);
            audioWorkletNodeRef.current.connect(inputAudioContextRef.current.destination);

            const callbacks = {
                onopen: () => {
                    setStatus('active');
                    audioWorkletNodeRef.current!.port.onmessage = (event) => {
                        const inputData = event.data;
                        sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: createBlob(inputData) }));
                    };
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.toolCall) {
                        for (const fc of message.toolCall.functionCalls) {
                            if (fc.name === 'updatePlan') {
                                setPlan(prev => ({
                                    myWhy: fc.args.myWhy || prev.myWhy,
                                    triggers: [...new Set([...prev.triggers, ...(fc.args.triggers || [])])],
                                    copingStrategies: [...new Set([...prev.copingStrategies, ...(fc.args.copingStrategies || [])])],
                                    supportNetwork: [...prev.supportNetwork, ...(fc.args.supportNetwork || [])]
                                }));
                                sessionPromiseRef.current?.then(session => session.sendToolResponse({
                                    functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } }
                                }));
                            }
                        }
                    }
                    const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (audio && outputAudioContextRef.current) {
                        const outCtx = outputAudioContextRef.current;
                        const audioBuffer = await decodeAudioData(decode(audio), outCtx, 24000, 1);
                        const sourceNode = outCtx.createBufferSource();
                        sourceNode.buffer = audioBuffer;
                        sourceNode.connect(outCtx.destination);
                        sourceNode.start();
                    }
                },
                onerror: (e: ErrorEvent) => { setError(e.message); cleanup(); },
                onclose: () => cleanup(),
            };

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks,
                config: {
                    responseModalities: [Modality.AUDIO],
                    tools: [{ functionDeclarations: [updatePlanFunctionDeclaration] }],
                    systemInstruction,
                }
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : t('live_talk.error_mic'));
            setStatus('error');
        }
    };

    const handleSavePlan = () => {
        setStatus('saving');
        try {
            localStorage.setItem(getScopedKey('prevention-plan'), JSON.stringify(plan));
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (e) {
            setError('Failed to save plan.');
            setStatus('error');
        }
    };
    
    return (
        <>
            <SEOMeta title={t('seo.prevention_plan.title')} description={t('seo.prevention_plan.description')} noIndex={true} />
            <div className="py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('prevention_plan_page.title')}</h1>
                        <p className="mt-3 text-lg text-base-600 dark:text-base-300">{t('prevention_plan_page.subtitle')}</p>
                    </div>

                    <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft p-6 space-y-6">
                        <PlanSection title={t('prevention_plan_page.my_why_title')}>
                            <p className="italic text-lg text-base-800 dark:text-base-200">{plan.myWhy || ' '}</p>
                        </PlanSection>

                        <PlanSection title={t('prevention_plan_page.triggers_title')}>
                            <ListItems items={plan.triggers} />
                        </PlanSection>
                        
                        <PlanSection title={t('prevention_plan_page.coping_title')}>
                            <ListItems items={plan.copingStrategies} />
                        </PlanSection>
                        
                        <PlanSection title={t('prevention_plan_page.support_title')}>
                             {plan.supportNetwork.length > 0 ? (
                                <ul className="space-y-2">
                                    {plan.supportNetwork.map((person, i) => (
                                        <li key={`${person.name}-${i}`} className="flex items-center gap-2 p-2 bg-base-100 dark:bg-base-700/50 rounded-md animate-fade-in">
                                            <span className="font-semibold text-base-800 dark:text-base-200">{person.name}</span>
                                            <span className="text-sm text-base-600 dark:text-base-400">- {person.contactInfo}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-base-500 dark:text-base-400"> </p>}
                        </PlanSection>
                    </div>

                    <div className="mt-8 text-center space-y-4">
                        {status === 'idle' || status === 'ended' || status === 'error' ? (
                            <button onClick={handleStartSession} className="bg-primary-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-600">
                                {plan.myWhy ? "Continue Building Plan" : "Start Building Plan"}
                            </button>
                        ) : status === 'connecting' || status === 'active' ? (
                            <button onClick={cleanup} className="bg-warning-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-warning-600">
                                {status === 'connecting' ? t('live_talk.connecting_button') : "End Session"}
                            </button>
                        ) : null}

                        {error && <p className="text-warning-500 mt-4">{error}</p>}
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={handleSavePlan} disabled={status === 'saving'} className="text-sm font-semibold bg-base-800 text-white dark:bg-base-200 dark:text-base-900 py-2 px-6 rounded-lg hover:bg-base-700 dark:hover:bg-base-300 transition-colors disabled:opacity-50">
                                {status === 'saving' ? "Saving..." : t('prevention_plan_page.save_button')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </>
    );
};

const PlanSection: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <div>
        <h2 className="text-xl font-bold text-primary-500 mb-3 border-b border-primary-200 dark:border-primary-800 pb-2">{title}</h2>
        <div className="min-h-[1.5rem]">
            {children}
        </div>
    </div>
);

const ListItems: React.FC<{items: string[]}> = ({ items }) => {
    if (items.length === 0) return <p className="text-base-500 dark:text-base-400"> </p>;
    return (
        <ul className="list-disc list-inside space-y-1 text-base-700 dark:text-base-300">
            {items.map((item, i) => <li key={`${item}-${i}`} className="animate-fade-in">{item}</li>)}
        </ul>
    );
}

export default PreventionPlanPage;