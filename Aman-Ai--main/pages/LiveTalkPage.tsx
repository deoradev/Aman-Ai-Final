

import React, { useState, useEffect, useRef } from 'react';
import { LiveServerMessage, Modality, Blob as GenAIBlob, FunctionDeclaration, Type } from '@google/genai';
import { useLocalization } from '../hooks/useLocalization';
import { useConnectivity } from '../hooks/useConnectivity';
import { useAuth } from '../hooks/useAuth';
import SEOMeta from '../components/SEOMeta';
import { buildLiveTalkSystemInstruction, getUserContext, getScopedKey, encode, decode, decodeAudioData, createBlob } from '../utils';
import { PERSONAS } from '../constants';
import VoiceVisualizer from '../components/VoiceVisualizer';
import { MoodEntry, Persona } from '../types';
import { ai } from '../services/geminiService';
import Logo from '../components/Logo';

type LiveSessionState = 'idle' | 'connecting' | 'live' | 'speaking' | 'error' | 'closed';
interface TranscriptMessage {
    speaker: 'user' | 'model' | 'system';
    text: string;
    isFinal?: boolean;
    timestamp: number;
}

const logMoodFunctionDeclaration: FunctionDeclaration = {
  name: 'logMood',
  parameters: {
    type: Type.OBJECT,
    description: 'Logs the user\'s current mood.',
    properties: {
      mood: {
        type: Type.STRING,
        description: 'The mood to log, must be one of "happy", "neutral", or "sad".',
      },
    },
    required: ['mood'],
  },
};

const LiveTalkPage: React.FC = () => {
    const { t } = useLocalization();
    const { isOnline } = useConnectivity();
    const { getScopedKey } = useAuth();
    const userContext = getUserContext();

    const [sessionState, setSessionState] = useState<LiveSessionState>('idle');
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
    const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Puck'>('Zephyr');

    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioPlaybackSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    
    useEffect(() => {
        if (userContext) {
            setCurrentPersona(PERSONAS.find(p => p.id === userContext.personaId) || PERSONAS[0]);
        }
    }, [userContext?.personaId]);

    useEffect(() => {
        const savedVoice = localStorage.getItem(getScopedKey('live-talk-voice')) as 'Zephyr' | 'Puck' | null;
        if (savedVoice) {
            setSelectedVoice(savedVoice);
        }
    }, [getScopedKey]);

    const cleanup = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        mediaStreamSourceRef.current?.disconnect();
        analyserRef.current?.disconnect();
        mediaStreamSourceRef.current?.mediaStream.getTracks().forEach(track => track.stop());
        inputAudioContextRef.current?.close().catch(e => console.error("Error closing input audio context:", e));
        outputAudioContextRef.current?.close().catch(e => console.error("Error closing output audio context:", e));

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

    const handleStopConversation = () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => {
                session.close();
            }).catch(e => console.error("Error closing session:", e));
        }
        cleanup();
        setSessionState('closed');
    };
    
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    useEffect(() => {
        return () => { handleStopConversation(); };
    }, []);

    const handleExportTranscript = () => {
        const content = transcript.map(msg => {
            const time = new Date(msg.timestamp).toLocaleString();
            const speaker = msg.speaker === 'user' ? t('live_talk.user') : (msg.speaker === 'model' ? t('live_talk.model') : 'System');
            return `[${time}] ${speaker}:\n${msg.text}`;
        }).join('\n\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        link.download = t('live_talk.transcript.download_filename', { date: dateStr });
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const visualize = () => {
        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteTimeDomainData(dataArray);
            setAudioData(dataArray);

            const speaking = dataArray.some(v => v > 132); // 128 is silence
            setIsUserSpeaking(speaking);
        }
        animationFrameRef.current = requestAnimationFrame(visualize);
    };

    const handleLogMood = (mood: MoodEntry['mood']) => {
        if (!['happy', 'neutral', 'sad'].includes(mood)) return;
        const todayStr = new Date().toISOString().split('T')[0];
        const key = getScopedKey('mood-history');
        const moods: MoodEntry[] = JSON.parse(localStorage.getItem(key) || '[]') as MoodEntry[];
        const newMoods = moods.filter(m => m.date !== todayStr);
        newMoods.push({ date: todayStr, mood });
        localStorage.setItem(key, JSON.stringify(newMoods));
        
        setTranscript(prev => [...prev, {
            speaker: 'system',
            text: t('live_talk.mood_logged', { mood: t(`dashboard.mood.${mood}`) }),
            isFinal: true,
            timestamp: Date.now()
        }]);
    };

    const handleStartConversation = async () => {
        setError(null);
        setTranscript([]);
        setSessionState('connecting');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            await inputAudioContextRef.current.audioWorklet.addModule('/Aman-Ai--main/audioProcessor.js');
            
            const systemInstruction = buildLiveTalkSystemInstruction(t);
            if (!systemInstruction) throw new Error("Could not build system instruction.");

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    tools: [{ functionDeclarations: [logMoodFunctionDeclaration] }],
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
                    systemInstruction,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        const inputCtx = inputAudioContextRef.current!;
                        mediaStreamSourceRef.current = inputCtx.createMediaStreamSource(stream);
                        analyserRef.current = inputCtx.createAnalyser();
                        const workletNode = new AudioWorkletNode(inputCtx, 'audio-processor');
                        
                        workletNode.port.onmessage = (event) => {
                            const inputData = event.data;
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: createBlob(inputData) });
                            });
                        };
                        
                        mediaStreamSourceRef.current.connect(analyserRef.current);
                        analyserRef.current.connect(workletNode);
                        workletNode.connect(inputCtx.destination);
                        
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
                                if (last && last.speaker === 'user' && !last.isFinal) return [...prev.slice(0, -1), { ...last, text: last.text + text, isFinal, timestamp: Date.now() }];
                                return [...prev, { speaker: 'user', text, isFinal, timestamp: Date.now() }];
                            });
                        }

                        if (msg.serverContent?.outputTranscription) {
                            const { text } = msg.serverContent.outputTranscription;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.speaker === 'model' && !last.isFinal) return [...prev.slice(0, -1), { ...last, text: last.text + text, isFinal, timestamp: Date.now() }];
                                return [...prev, { speaker: 'model', text, isFinal, timestamp: Date.now() }];
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
                                if (call.name === 'logMood') {
                                    try {
                                        const mood = call.args.mood as MoodEntry['mood'];
                                        handleLogMood(mood);
                                        sessionPromiseRef.current?.then(session => {
                                            session.sendToolResponse({
                                                functionResponses: [{ id: call.id, name: call.name, response: { result: `Successfully logged mood as ${mood}.` } }]
                                            })
                                        });
                                    } catch (toolError) { console.error("Error executing tool call:", toolError); }
                                }
                            }
                        }
                    },
                    onerror: (e) => { setError(t('live_talk.status.error')); setSessionState('error'); cleanup(); console.error(e); },
                    onclose: () => { setSessionState('closed'); cleanup(); }
                }
            });
        } catch (err) {
            console.error(err);
            setError(t('live_talk.mic_permission'));
            setSessionState('error');
        }
    };

    const getStatusText = () => {
        switch (sessionState) {
            case 'connecting': return t('live_talk.status.connecting');
            case 'live': return t('live_talk.status.live');
            case 'speaking': return t('live_talk.status.speaking');
            case 'closed': return t('live_talk.status.closed');
            case 'error': return error || t('live_talk.status.error');
            default: return t('live_talk.status.idle');
        }
    };
    
    if (!userContext) {
        return (
             <div className="py-12 flex-grow flex items-center justify-center">
                <div className="text-center p-8 bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft-lg max-w-lg mx-auto">
                    <div className="flex justify-center mb-4"><Logo /></div>
                    <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('live_talk.title')}</h2>
                    <p className="text-base-600 dark:text-base-400 mb-6">{t('prevention_plan_page.no_program_error')}</p>
                    <a href="/#/programs" className="inline-block bg-primary-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors">
                        {t('prevention_plan_page.select_program_link')}
                    </a>
                </div>
            </div>
        )
    }

    return (
        <>
            <SEOMeta title={t('seo.live_talk.title')} description={t('seo.live_talk.description')} noIndex={true} />
            <div className="py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('live_talk.title')}</h1>
                            <p className="mt-3 text-lg text-base-600 dark:text-base-300">{t('live_talk.subtitle')}</p>
                        </div>
                        
                        <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft-lg flex flex-col min-h-[70vh]">
                            <div className="p-4 border-b border-base-200 dark:border-base-700 text-center">
                                <h2 className="font-bold text-primary-600 dark:text-primary-400">{currentPersona?.name || ''}</h2>
                                <p className="text-sm text-base-500 dark:text-base-400">{getStatusText()}</p>
                            </div>

                            <div className="p-4 bg-base-50/50 dark:bg-base-900/30 flex-grow overflow-y-auto">
                                <div className="space-y-4">
                                    {transcript.map((msg, i) => (
                                        <div key={i}>
                                            <p className={`font-bold ${
                                                msg.speaker === 'user' ? 'text-primary-600 dark:text-primary-400' 
                                                : msg.speaker === 'system' ? 'text-secondary-600 dark:text-secondary-400'
                                                : 'text-base-800 dark:text-base-200'}`
                                            }>{
                                                msg.speaker === 'user' ? t('live_talk.user') 
                                                : msg.speaker === 'system' ? t('live_talk.system') 
                                                : t('live_talk.model')
                                            }</p>
                                            <p className={`text-base-700 dark:text-base-300 ${!msg.isFinal && 'opacity-60'}`}>{msg.text}</p>
                                        </div>
                                    ))}
                                    <div ref={transcriptEndRef}></div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-white/80 dark:bg-base-800/80 border-t border-base-200 dark:border-base-700 flex flex-col items-center gap-4">
                                <VoiceVisualizer audioData={audioData} isUserSpeaking={isUserSpeaking} isAIThinking={sessionState === 'speaking'} />
                                
                                {sessionState === 'idle' || sessionState === 'closed' || sessionState === 'error' ? (
                                    <button onClick={handleStartConversation} disabled={!isOnline || !userContext} className="bg-primary-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-600 transition-colors disabled:bg-base-400">
                                        {t('live_talk.start_button')}
                                    </button>
                                ) : (
                                    <button onClick={handleStopConversation} className="bg-warning-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-warning-600">
                                        {t('live_talk.stop_button')}
                                    </button>
                                )}

                                {transcript.length > 2 && (sessionState === 'closed' || sessionState === 'error') && (
                                     <button onClick={handleExportTranscript} className="text-sm font-semibold text-primary-600 hover:underline">
                                        {t('live_talk.transcript.export_button')}
                                    </button>
                                )}

                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm font-semibold">{t('live_talk.voice_selection.title')}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setSelectedVoice('Zephyr'); localStorage.setItem(getScopedKey('live-talk-voice'), 'Zephyr'); }} className={`px-4 py-1 rounded-full text-sm ${selectedVoice === 'Zephyr' ? 'bg-primary-500 text-white' : 'bg-base-200 dark:bg-base-700'}`}>
                                            {t('live_talk.voice_selection.female')}
                                        </button>
                                         <button onClick={() => { setSelectedVoice('Puck'); localStorage.setItem(getScopedKey('live-talk-voice'), 'Puck'); }} className={`px-4 py-1 rounded-full text-sm ${selectedVoice === 'Puck' ? 'bg-primary-500 text-white' : 'bg-base-200 dark:bg-base-700'}`}>
                                            {t('live_talk.voice_selection.male')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LiveTalkPage;