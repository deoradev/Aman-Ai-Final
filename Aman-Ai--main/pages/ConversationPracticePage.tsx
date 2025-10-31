import React, { useState, useEffect, useRef } from 'react';
import { LiveServerMessage, Modality, Blob as GenAIBlob } from '@google/genai';
import { useLocalization } from '../hooks/useLocalization';
import { useConnectivity } from '../hooks/useConnectivity';
import SEOMeta from '../components/SEOMeta';
import { CONVERSATION_SCENARIOS } from '../constants';
import { ConversationPracticeScenario, RolePlayPersona } from '../types';
import VoiceVisualizer from '../components/VoiceVisualizer';
import { getConversationFeedback } from '../services/geminiService';
import SimpleMarkdownRenderer from '../components/SimpleMarkdownRenderer';
import { ai } from '../services/geminiService';


// --- Audio Helper Functions (as per guidelines) ---
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

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
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
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
// --- End Audio Helper Functions ---


type PracticeStep = 'scenario_selection' | 'persona_selection' | 'conversation' | 'feedback';
type SessionState = 'idle' | 'connecting' | 'live' | 'speaking' | 'error' | 'ended';
interface TranscriptMessage {
    speaker: 'user' | 'model';
    text: string;
    isFinal?: boolean;
}

const ConversationPracticePage: React.FC = () => {
    const { t, language } = useLocalization();
    const { isOnline } = useConnectivity();

    const [step, setStep] = useState<PracticeStep>('scenario_selection');
    const [selectedScenario, setSelectedScenario] = useState<ConversationPracticeScenario | null>(null);
    const [selectedPersona, setSelectedPersona] = useState<RolePlayPersona | null>(null);

    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioPlaybackSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const animationFrameRef = useRef<number | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const cleanup = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        
        audioWorkletNodeRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        analyserRef.current?.disconnect();
        mediaStreamSourceRef.current?.mediaStream.getTracks().forEach(track => track.stop());

        inputAudioContextRef.current?.close().catch(e => console.error("Error closing input audio context:", e));
        outputAudioContextRef.current?.close().catch(e => console.error("Error closing output audio context:", e));
        
        audioWorkletNodeRef.current = null;
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

    const handleEndConversation = async () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close()).catch(console.error);
        }
        cleanup();
        setSessionState('ended');

        // Only proceed to feedback if a scenario and persona have been selected.
        if (!selectedScenario || !selectedPersona) {
            return;
        }
        
        setStep('feedback');

        try {
            const finalTranscript = transcript.filter(t => t.isFinal);
            const feedbackResult = await getConversationFeedback(finalTranscript, t(`conversation_practice.scenarios.${selectedScenario.id}.title`), selectedPersona.name, language);
            setFeedback(feedbackResult);
        } catch (e) {
            console.error(e);
            setFeedback(t('toolkit.error'));
        }
    };
    
    useEffect(() => {
        // Cleanup on component unmount
        return () => { handleEndConversation(); };
    }, []);

    const visualize = () => {
        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteTimeDomainData(dataArray);
            setAudioData(dataArray);
            setIsUserSpeaking(dataArray.some(v => v > 130)); // 128 is silence
        }
        animationFrameRef.current = requestAnimationFrame(visualize);
    };

    const handleStartConversation = async () => {
        if (!selectedScenario || !selectedPersona) return;

        setError(null);
        setTranscript([]);
        setSessionState('connecting');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const systemInstruction = `
                You are an AI role-play partner. You must fully embody the character described below and interact with the user based on the given scenario. Do not break character. Do not reveal you are an AI.
                
                SCENARIO: ${selectedScenario.systemPrompt}
                YOUR CHARACTER: ${selectedPersona.systemPrompt}

                Respond ONLY in this language: ${language}.
            `;

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: async () => {
                        const inputCtx = inputAudioContextRef.current!;
                        await inputCtx.audioWorklet.addModule('/Aman-Ai--main/audioProcessor.js');

                        mediaStreamSourceRef.current = inputCtx.createMediaStreamSource(stream);
                        audioWorkletNodeRef.current = new AudioWorkletNode(inputCtx, 'audio-processor');
                        analyserRef.current = inputCtx.createAnalyser();
                        
                        audioWorkletNodeRef.current.port.onmessage = (event) => {
                            const pcmBlob = createBlob(event.data);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        mediaStreamSourceRef.current.connect(analyserRef.current);
                        analyserRef.current.connect(audioWorkletNodeRef.current);
                        audioWorkletNodeRef.current.connect(inputCtx.destination);
                        
                        setSessionState('live');
                        visualize();
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        setSessionState('speaking');

                        const isFinal = !!message.serverContent?.turnComplete;

                        if (message.serverContent?.inputTranscription) {
                            const { text } = message.serverContent.inputTranscription;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.speaker === 'user' && !last.isFinal) {
                                    return [...prev.slice(0, -1), { ...last, text: last.text + text, isFinal }];
                                }
                                return [...prev, { speaker: 'user', text, isFinal }];
                            });
                        }

                        if (message.serverContent?.outputTranscription) {
                            const { text } = message.serverContent.outputTranscription;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.speaker === 'model' && !last.isFinal) {
                                    return [...prev.slice(0, -1), { ...last, text: last.text + text, isFinal }];
                                }
                                return [...prev, { speaker: 'model', text, isFinal }];
                            });
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
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
                                    if (audioPlaybackSourcesRef.current.size === 0) {
                                        setSessionState('live');
                                    }
                                });
                                
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                audioPlaybackSourcesRef.current.add(source);
                            } catch (audioError) {
                                console.error("Error decoding or playing audio:", audioError);
                            }
                        } else if (message.serverContent && !base64Audio) {
                            // If we received transcript but no audio, transition back to live
                             if (audioPlaybackSourcesRef.current.size === 0) setSessionState('live');
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setError(t('live_talk.status.error'));
                        setSessionState('error');
                        cleanup();
                    },
                    onclose: (e: CloseEvent) => {
                        if (sessionState !== 'ended') { // Avoid calling feedback twice
                            handleEndConversation();
                        }
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                    systemInstruction: systemInstruction,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });
        } catch (err) {
            console.error('Failed to start conversation:', err);
            setError(t('live_talk.mic_permission'));
            setSessionState('error');
        }
    };

    const handleReset = () => {
        setStep('scenario_selection');
        setSelectedScenario(null);
        setSelectedPersona(null);
        setSessionState('idle');
        setTranscript([]);
        setFeedback(null);
        setError(null);
    }
    
    const renderContent = () => {
        switch (step) {
            case 'scenario_selection':
                return (
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('conversation_practice.select_scenario')}</h2>
                        <div className="space-y-3">
                            {CONVERSATION_SCENARIOS.map(sc => (
                                <button key={sc.id} onClick={() => { setSelectedScenario(sc); setStep('persona_selection'); }} className="w-full text-left p-4 bg-base-50 dark:bg-base-700/50 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:ring-2 hover:ring-primary-500 transition-all">
                                    <p className="font-semibold">{t(`conversation_practice.scenarios.${sc.id}.title`)}</p>
                                    <p className="text-sm text-base-600 dark:text-base-400">{t(`conversation_practice.scenarios.${sc.id}.description`)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'persona_selection':
                return (
                     <div className="p-6">
                        <h2 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-1">{t('conversation_practice.select_persona')}</h2>
                        <p className="text-base-600 dark:text-base-300 mb-4">{t(`conversation_practice.scenarios.${selectedScenario?.id}.title`)}</p>
                        <div className="space-y-3">
                            {selectedScenario?.personas.map(p => (
                                <button key={p.id} onClick={() => { setSelectedPersona(p); setStep('conversation'); handleStartConversation(); }} className="w-full text-left p-4 bg-base-50 dark:bg-base-700/50 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:ring-2 hover:ring-primary-500 transition-all">
                                    <p className="font-semibold">{p.name}</p>
                                    <p className="text-sm text-base-600 dark:text-base-400">{p.description}</p>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep('scenario_selection')} className="mt-6 text-sm font-semibold text-primary-600 hover:underline">{t('conversation_practice.back_to_scenarios')}</button>
                    </div>
                );
            case 'conversation':
                 return (
                    <div className="flex-grow flex flex-col h-full">
                        <div className="p-4 border-b border-base-200 dark:border-base-700 text-center">
                            <h2 className="font-bold text-primary-600 dark:text-primary-400">{t(`conversation_practice.scenarios.${selectedScenario?.id}.title`)}</h2>
                            <p className="text-sm text-base-500 dark:text-base-400">vs. {selectedPersona?.name}</p>
                        </div>
                        <div className="p-4 bg-base-50/50 dark:bg-base-900/30 flex-grow overflow-y-auto">
                            <div className="space-y-4">
                                {transcript.map((msg, i) => (
                                    <div key={i}>
                                        <p className={`font-bold ${msg.speaker === 'user' ? 'text-primary-600 dark:text-primary-400' : 'text-base-800 dark:text-base-200'}`}>{msg.speaker === 'user' ? t('live_talk.user') : t('live_talk.model')}</p>
                                        <p className={`text-base-700 dark:text-base-300 ${!msg.isFinal && 'opacity-60'}`}>{msg.text}</p>
                                    </div>
                                ))}
                                <div ref={transcriptEndRef}></div>
                            </div>
                        </div>
                        <div className="p-4 bg-white/80 dark:bg-base-800/80 border-t border-base-200 dark:border-base-700 flex flex-col items-center">
                            <VoiceVisualizer audioData={audioData} isUserSpeaking={isUserSpeaking} isAIThinking={sessionState === 'speaking'} />
                            <button onClick={handleEndConversation} className="mt-4 bg-warning-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-warning-600">{t('conversation_practice.end_session')}</button>
                        </div>
                    </div>
                );
            case 'feedback':
                return (
                     <div className="p-6 overflow-y-auto">
                        <h2 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('conversation_practice.feedback_title')}</h2>
                        {feedback ? <SimpleMarkdownRenderer content={feedback} /> : 
                            <div className="flex items-center justify-center p-8 space-x-2">
                                <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                                <p>{t('conversation_practice.generating_feedback')}</p>
                            </div>
                        }
                        <button onClick={handleReset} className="mt-6 w-full bg-primary-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-600">{t('conversation_practice.practice_again')}</button>
                    </div>
                );
        }
    }

    return (
        <>
            <SEOMeta title={t('seo.conversation_practice.title')} description={t('seo.conversation_practice.description')} noIndex={true} />
            <div className="py-12 flex-grow flex flex-col">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('conversation_practice.title')}</h1>
                        <p className="mt-3 text-lg text-base-600 dark:text-base-300 max-w-2xl mx-auto">{t('conversation_practice.subtitle')}</p>
                    </div>

                    <div className="max-w-2xl mx-auto w-full bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft-lg flex-grow flex flex-col min-h-[60vh]">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConversationPracticePage;
