import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useConnectivity } from '../hooks/useConnectivity';
import { useAuth } from '../hooks/useAuth';
import { LiveSession, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { ai } from '../services/geminiService';
import { MoodEntry } from '../types';
import { buildLiveTalkSystemInstruction, createBlob, decode, decodeAudioData } from '../utils';
import VoiceVisualizer from '../components/VoiceVisualizer';
import SEOMeta from '../components/SEOMeta';
import TranscriptionBubble from '../components/TranscriptionBubble';

type Status = 'idle' | 'connecting' | 'connected' | 'ended' | 'error';
type Transcription = { author: 'You' | 'Aman AI', text: string };

const logMoodFunctionDeclaration: FunctionDeclaration = {
  name: 'logMood',
  parameters: {
    type: Type.OBJECT,
    description: 'Logs the user\'s current mood to their daily record.',
    properties: {
      mood: {
        type: Type.STRING,
        description: 'The mood to log. Must be one of "happy", "neutral", or "sad".',
      },
    },
    required: ['mood'],
  },
};

const StatusIndicator: React.FC<{ status: Status }> = ({ status }) => {
    const { t } = useLocalization();

    const getStatusInfo = () => {
        switch (status) {
            case 'connecting':
                return { text: t('live_talk.status.connecting'), icon: <div className="w-3 h-3 bg-primary-400 rounded-full animate-pulse" />, color: 'text-primary-600 dark:text-primary-300' };
            case 'connected':
                return { text: t('live_talk.status.connected'), icon: <div className="w-3 h-3 bg-accent-500 rounded-full animate-pulse" />, color: 'text-accent-600 dark:text-accent-300' };
            case 'error':
                 return { text: t('live_talk.status.error'), icon: <div className="w-3 h-3 bg-warning-500 rounded-full" />, color: 'text-warning-600 dark:text-warning-300' };
            case 'ended':
                 return { text: t('live_talk.status.closed'), icon: <div className="w-3 h-3 bg-base-400 rounded-full" />, color: 'text-base-500' };
            default:
                return { text: t('live_talk.status.idle'), icon: <div className="w-3 h-3 bg-base-400 rounded-full" />, color: 'text-base-500' };
        }
    }
    const { text, icon, color } = getStatusInfo();
    return <div className={`flex items-center justify-center gap-2 font-semibold text-sm ${color}`}>
        {icon}
        <span>{text}</span>
    </div>;
}

const AmanAvatar: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-primary-500 dark:text-primary-400">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z M12 7 L 8 11 L 10 16 L 12 14 L 14 16 L 16 11 Z" />
    </svg>
);

const UserAvatar: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-600 dark:text-base-300" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);


const LiveTalkPage: React.FC = () => {
  const { t } = useLocalization();
  const { isOnline } = useConnectivity();
  const { getScopedKey } = useAuth();

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(128));
  const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Fenrir'>('Zephyr');

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const processorUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    animationFrameId.current && cancelAnimationFrame(animationFrameId.current);
    
    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;

    inputAudioContextRef.current?.close().catch(e => console.error("Error closing input context:", e));
    outputAudioContextRef.current?.close().catch(e => console.error("Error closing output context:", e));
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;

    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;

    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    
    if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.port.onmessage = null;
        audioWorkletNodeRef.current.disconnect();
        audioWorkletNodeRef.current = null;
    }

    if (processorUrlRef.current) {
        URL.revokeObjectURL(processorUrlRef.current);
        processorUrlRef.current = null;
    }

    setIsUserSpeaking(false);
    setIsAISpeaking(false);
    setStatus('ended');
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const visualize = useCallback(() => {
    if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
        setAudioData(new Uint8Array(dataArrayRef.current));

        const avg = dataArrayRef.current.reduce((sum, val) => sum + Math.abs(val - 128), 0) / dataArrayRef.current.length;
        setIsUserSpeaking(avg > 2);
    }
    animationFrameId.current = requestAnimationFrame(visualize);
  }, []);

  const handleStart = async () => {
    if (status !== 'idle' && status !== 'ended' && status !== 'error') return;
    setStatus('connecting');
    setError(null);
    setTranscriptions([]);

    try {
      const systemInstruction = buildLiveTalkSystemInstruction(t);
      if (!systemInstruction) throw new Error("Could not build system instruction. Are you enrolled in a program?");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (!inputAudioContextRef.current.audioWorklet) {
        throw new Error("AudioWorklet not supported in this browser.");
      }
      
      const audioProcessorCode = `
        class AudioProcessor extends AudioWorkletProcessor {
          constructor() { super(); }
          process(inputs) {
            const channel = inputs[0]?.[0];
            if (channel) { this.port.postMessage(channel.slice()); }
            return true;
          }
        }
        registerProcessor('audio-processor', AudioProcessor);
      `;
      const blob = new Blob([audioProcessorCode], { type: 'application/javascript' });
      processorUrlRef.current = URL.createObjectURL(blob);
      await inputAudioContextRef.current.audioWorklet.addModule(processorUrlRef.current);
      audioWorkletNodeRef.current = new AudioWorkletNode(inputAudioContextRef.current, 'audio-processor');

      audioWorkletNodeRef.current.port.onmessage = (event) => {
        const inputData = event.data;
        const pcmBlob = createBlob(inputData);
        sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
      };
      
      const source = inputAudioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = inputAudioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioWorkletNodeRef.current);
      audioWorkletNodeRef.current.connect(inputAudioContextRef.current.destination);

      visualize();

      const callbacks = {
        onopen: () => {
            setStatus('connected');
        },
        onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
                setTranscriptions(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.author === t('live_talk.model')) {
                        last.text += message.serverContent.outputTranscription.text;
                        return [...prev.slice(0, -1), last];
                    }
                    return [...prev, { author: t('live_talk.model'), text: message.serverContent.outputTranscription.text }];
                });
            }
            if (message.serverContent?.inputTranscription) {
                 setTranscriptions(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.author === t('live_talk.user')) {
                        last.text += message.serverContent.inputTranscription.text;
                        return [...prev.slice(0, -1), last];
                    }
                    return [...prev, { author: t('live_talk.user'), text: message.serverContent.inputTranscription.text }];
                });
            }

            if (message.toolCall) {
                for (const fc of message.toolCall.functionCalls) {
                    if (fc.name === 'logMood' && (fc.args.mood === 'happy' || fc.args.mood === 'neutral' || fc.args.mood === 'sad')) {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const key = getScopedKey('mood-history');
                        const moods: MoodEntry[] = JSON.parse(localStorage.getItem(key) || '[]') as MoodEntry[];
                        const newMoods = moods.filter(m => m.date !== todayStr);
                        newMoods.push({ date: todayStr, mood: fc.args.mood });
                        localStorage.setItem(key, JSON.stringify(newMoods));

                        sessionPromiseRef.current?.then(session => session.sendToolResponse({
                            functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } }
                        }));
                    }
                }
            }

            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
            if (audio && outputAudioContextRef.current) {
                setIsAISpeaking(true);
                const outCtx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                const audioBuffer = await decodeAudioData(decode(audio), outCtx, 24000, 1);
                
                const sourceNode = outCtx.createBufferSource();
                sourceNode.buffer = audioBuffer;
                sourceNode.connect(outCtx.destination);
                sourceNode.addEventListener('ended', () => {
                    sourcesRef.current.delete(sourceNode);
                    if (sourcesRef.current.size === 0) {
                        setIsAISpeaking(false);
                    }
                });
                sourceNode.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(sourceNode);
            }
        },
        onerror: (e: ErrorEvent) => {
            setError(e.message || "An unknown error occurred.");
            cleanup();
        },
        onclose: () => {
            cleanup();
        },
      };

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{ functionDeclarations: [logMoodFunctionDeclaration] }],
          speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
          },
          systemInstruction,
        },
      });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('live_talk.error_mic'));
      cleanup();
      setStatus('error');
    }
  };

  const isSessionActive = status === 'connecting' || status === 'connected';

  return (
    <>
      <SEOMeta title={t('seo.live_talk.title')} description={t('seo.live_talk.description')} noIndex={true} />
      <div className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('live_talk.title')}</h1>
            <p className="mt-3 text-lg text-base-600 dark:text-base-300">{t('live_talk.subtitle')}</p>
          </div>
          <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft overflow-hidden border border-base-200 dark:border-base-700">
            <div className="p-6 text-center">
                <VoiceVisualizer audioData={audioData} isUserSpeaking={isUserSpeaking} isAISpeaking={isAISpeaking} />
                <div className="mt-4">
                  <StatusIndicator status={status} />
                </div>
                {!isSessionActive && (
                    <div className="mt-4 animate-fade-in">
                        <label className="text-sm font-medium text-base-700 dark:text-base-300">{t('live_talk.voice_selection.title')}</label>
                        <div className="flex justify-center gap-4 mt-2">
                            <div>
                                <input 
                                    type="radio" 
                                    id="female-voice" 
                                    name="voice" 
                                    value="Zephyr" 
                                    checked={selectedVoice === 'Zephyr'}
                                    onChange={() => setSelectedVoice('Zephyr')}
                                    disabled={isSessionActive}
                                    className="sr-only peer"
                                />
                                <label htmlFor="female-voice" className="px-4 py-2 border-2 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:text-primary-600 dark:peer-checked:text-primary-400 peer-disabled:opacity-50">
                                    {t('live_talk.voice_selection.female')}
                                </label>
                            </div>
                            <div>
                                <input 
                                    type="radio" 
                                    id="male-voice" 
                                    name="voice" 
                                    value="Fenrir" 
                                    checked={selectedVoice === 'Fenrir'}
                                    onChange={() => setSelectedVoice('Fenrir')}
                                    disabled={isSessionActive}
                                    className="sr-only peer"
                                />
                                <label htmlFor="male-voice" className="px-4 py-2 border-2 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:text-primary-600 dark:peer-checked:text-primary-400 peer-disabled:opacity-50">
                                    {t('live_talk.voice_selection.male')}
                                </label>
                            </div>
                        </div>
                    </div>
                )}
                <div className="mt-6">
                    {!isSessionActive ? (
                        <button onClick={handleStart} disabled={!isOnline} className="bg-primary-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-600 transition-transform hover:scale-105 shadow-soft-lg disabled:bg-base-400 animate-pulse-slow">
                            {t('live_talk.start_button')}
                        </button>
                    ) : (
                        <button onClick={cleanup} className="bg-warning-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-warning-600 transition-transform hover:scale-105 shadow-soft-lg">
                            {status === 'connecting' ? t('live_talk.connecting_button') : t('live_talk.stop_button')}
                        </button>
                    )}
                </div>
                {error && <p className="text-warning-500 mt-4">{error}</p>}
                {!isOnline && !isSessionActive && <p className="text-warning-500 mt-4">{t('offline.feature_unavailable')}</p>}
            </div>
            {transcriptions.length > 0 && (
                <div className="p-4 sm:p-6 bg-base-50/50 dark:bg-base-900/30 border-t border-base-200 dark:border-base-700 max-h-[50vh] overflow-y-auto" role="log" aria-live="polite">
                    <div className="space-y-4">
                        {transcriptions.map((transcript, index) => (
                           <TranscriptionBubble 
                                key={index} 
                                isUser={transcript.author === t('live_talk.user')}
                                author={transcript.author} 
                                text={transcript.text}
                                icon={transcript.author === t('live_talk.user') ? <UserAvatar /> : <AmanAvatar />}
                            />
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
          @keyframes fade-in {
              from { opacity: 0; transform: translateY(5px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
              animation: fade-in 0.5s ease-out forwards;
          }
          @keyframes pulse-slow {
              50% { opacity: 0.8; }
          }
          .animate-pulse-slow {
              animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
      `}</style>
    </>
  );
};

export default LiveTalkPage;