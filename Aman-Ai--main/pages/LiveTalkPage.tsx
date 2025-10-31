import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useConnectivity } from '../hooks/useConnectivity';
import { useAuth } from '../hooks/useAuth';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { ai } from '../services/geminiService';
// FIX: MoodEntry is exported from `types`, not `utils`.
import { MoodEntry } from '../types';
import { buildLiveTalkSystemInstruction, createBlob, decode, decodeAudioData } from '../utils';
import VoiceVisualizer from '../components/VoiceVisualizer';
import SEOMeta from '../components/SEOMeta';

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

const LiveTalkPage: React.FC = () => {
  const { t } = useLocalization();
  const { isOnline } = useConnectivity();
  const { getScopedKey } = useAuth();

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(128));
  const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Puck'>('Zephyr');

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

    setIsUserSpeaking(false);
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
    if (status !== 'idle' && status !== 'ended') return;
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
      await inputAudioContextRef.current.audioWorklet.addModule('/Aman-Ai--main/audioProcessor.js');
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
                setTranscriptions(prev => [...prev, { author: 'Aman AI', text: message.serverContent.outputTranscription.text }]);
            }
            if (message.serverContent?.inputTranscription) {
                setTranscriptions(prev => [...prev, { author: 'You', text: message.serverContent.inputTranscription.text }]);
            }

            if (message.toolCall) {
                for (const fc of message.toolCall.functionCalls) {
                    if (fc.name === 'logMood' && (fc.args.mood === 'happy' || fc.args.mood === 'neutral' || fc.args.mood === 'sad')) {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const key = getScopedKey('mood-history');
                        const moods: MoodEntry[] = JSON.parse(localStorage.getItem(key) || '[]');
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
                const outCtx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                const audioBuffer = await decodeAudioData(decode(audio), outCtx, 24000, 1);
                
                const sourceNode = outCtx.createBufferSource();
                sourceNode.buffer = audioBuffer;
                sourceNode.connect(outCtx.destination);
                sourceNode.addEventListener('ended', () => sourcesRef.current.delete(sourceNode));
                sourceNode.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(sourceNode);
            }
        },
        onerror: (e: ErrorEvent) => {
            setError(e.message || t('live_talk.error_generic'));
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
                <VoiceVisualizer audioData={audioData} isUserSpeaking={isUserSpeaking} isAIThinking={false} />
                <div className="mt-6">
                  {(status === 'idle' || status === 'ended' || status === 'error') && (
                    <div className="mt-4">
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
                                    // FIX: This `disabled` check is redundant and causes a type error because this block is only shown when status is 'idle', 'ended', or 'error'.
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
                                    value="Puck" 
                                    checked={selectedVoice === 'Puck'}
                                    onChange={() => setSelectedVoice('Puck')}
                                    // FIX: This `disabled` check is redundant and causes a type error because this block is only shown when status is 'idle', 'ended', or 'error'.
                                    className="sr-only peer"
                                />
                                <label htmlFor="male-voice" className="px-4 py-2 border-2 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:text-primary-600 dark:peer-checked:text-primary-400 peer-disabled:opacity-50">
                                    {t('live_talk.voice_selection.male')}
                                </label>
                            </div>
                        </div>
                    </div>
                  )}
                </div>
                <div className="mt-6">
                    {(status === 'idle' || status === 'ended' || status === 'error') && (
                        <button onClick={handleStart} disabled={!isOnline} className="bg-primary-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-600 transition-transform hover:scale-105 shadow-soft-lg disabled:bg-base-400">
                            {t('live_talk.start_button')}
                        </button>
                    )}
                    {(status === 'connecting' || status === 'connected') && (
                        <button onClick={cleanup} className="bg-warning-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-warning-600 transition-transform hover:scale-105 shadow-soft-lg">
                            {status === 'connecting' ? t('live_talk.connecting_button') : t('live_talk.stop_button')}
                        </button>
                    )}
                </div>
                {error && <p className="text-warning-500 mt-4">{error}</p>}
                {!isOnline && status !== 'connected' && <p className="text-warning-500 mt-4">{t('offline.feature_unavailable')}</p>}
            </div>
            {transcriptions.length > 0 && (
                <div className="p-6 bg-base-50/50 dark:bg-base-900/30 border-t border-base-200 dark:border-base-700 max-h-80 overflow-y-auto">
                    <div className="space-y-3">
                        {transcriptions.map((t, i) => (
                            <div key={i}>
                                <p className={`font-bold text-sm ${t.author === 'You' ? 'text-base-700 dark:text-base-300' : 'text-primary-600 dark:text-primary-400'}`}>{t.author}</p>
                                <p className="text-base-800 dark:text-base-200">{t.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LiveTalkPage;