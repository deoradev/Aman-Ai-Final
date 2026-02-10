
import { JournalEntry, Program, Persona, Milestone, MoodEntry, Goal, ChatMessage } from './types';
import { type Blob as GenAIBlob } from '@google/genai';
import { PERSONAS } from './constants';
import { summarizeRecentJournals, summarizeChatHistory } from './services/geminiService';

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {}
  },
  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {}
  },
  key: (index: number): string | null => {
      try {
          return window.localStorage.key(index);
      } catch (e) {
          return null;
      }
  },
  get length(): number {
    try {
      return window.localStorage.length;
    } catch(e) {
      return 0;
    }
  }
};

export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const getUserName = (currentUser: string): string => {
  const namePart = currentUser.split('@')[0];
  const cleanName = namePart.replace(/[^a-zA-Z0-9]/g, '');
  if (cleanName.length === 0) return 'User';
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
};

export const calculateJournalStreak = (entries: JournalEntry[]): number => {
    if (entries.length === 0) return 0;
    const uniqueDateStrings = new Set(entries.map(entry => new Date(entry.date).toISOString().split('T')[0]));
    const sortedDates = Array.from(uniqueDateStrings).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 0;
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
      streak = 1;
      let lastDate = new Date(sortedDates[0]);
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const expectedDate = new Date(lastDate);
        expectedDate.setDate(lastDate.getDate() - 1);
        if (currentDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
          streak++;
          lastDate = currentDate;
        } else break;
      }
    }
    return streak;
  };

export const formatTimeAgo = (timestamp: number, t: (key: string, params?: { [key: string]: string | number }) => string): string => {
    const now = new Date().getTime();
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 60) return t('utils.time.just_now');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t(minutes > 1 ? 'utils.time.minutes_ago' : 'utils.time.minute_ago', { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t(hours > 1 ? 'utils.time.hours_ago' : 'utils.time.hour_ago', { count: hours });
    const days = Math.floor(hours / 24);
    if (days < 7) return t(days > 1 ? 'utils.time.days_ago' : 'utils.time.day_ago', { count: days });
    return new Date(timestamp).toLocaleDateString();
};

export const getScopedKey = (key: string): string => {
    const currentUser = safeLocalStorage.getItem('amandigitalcare-currentUser');
    const scope = currentUser || 'anonymous';
    return `amandigitalcare-user-${scope}-${key}`;
};

export interface UserContext {
    program: string;
    day: number;
    language: string;
    personaId: string;
    age: number | null;
    gender: string | null;
}

export const getUserContext = (): UserContext | null => {
    const storedProgram = safeLocalStorage.getItem(getScopedKey('program'));
    const enrollmentDate = safeLocalStorage.getItem(getScopedKey('enrollmentDate'));
    const personaId = safeLocalStorage.getItem(getScopedKey('persona')) || 'therapist';
    const language = safeLocalStorage.getItem('amandigitalcare-language') || 'en';
    const storedAge = safeLocalStorage.getItem(getScopedKey('user-age'));
    const storedGender = safeLocalStorage.getItem(getScopedKey('user-gender'));
    if (!storedProgram || !enrollmentDate) return null;
    try {
        const program: Program = JSON.parse(storedProgram);
        const startDate = new Date(enrollmentDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const day = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return { program: program.name, day, language, personaId, age: storedAge ? parseInt(storedAge, 10) : null, gender: storedGender || null };
    } catch (e) { return null; }
};

export const buildMemorySummary = async (language: string): Promise<string> => {
    try {
        const moods: MoodEntry[] = JSON.parse(safeLocalStorage.getItem(getScopedKey('mood-history')) || '[]').slice(-3);
        const journals: JournalEntry[] = JSON.parse(safeLocalStorage.getItem(getScopedKey('journal-entries')) || '[]').slice(-3);
        const chatHistory: ChatMessage[] = JSON.parse(safeLocalStorage.getItem(getScopedKey('chat-history')) || '[]');
        const journalSummary = await summarizeRecentJournals(journals, language);
        const chatSummary = await summarizeChatHistory(chatHistory, language);
        return `Recent Moods: ${moods.map(m => m.mood).join(', ') || 'none'}. Journal: ${journalSummary}. Conversation: ${chatSummary}`;
    } catch { return "No summary available."; }
}

export const buildSystemInstruction = async (): Promise<string | null> => {
    const context = getUserContext();
    if (!context) return null;
    const selectedPersona = PERSONAS.find(p => p.id === context.personaId) || PERSONAS[0];
    const memorySummary = await buildMemorySummary(context.language);
    return `You are Aman AI. ${selectedPersona.systemInstruction}. Program: ${context.program}, Day: ${context.day}, Language: ${context.language}. Memory: ${memorySummary}`;
};

export const buildLiveTalkSystemInstruction = (t: (key: string, params?: { [key: string]: string | number }) => string): string | null => {
    const context = getUserContext();
    if (!context) return null;
    const selectedPersona = PERSONAS.find(p => p.id === context.personaId) || PERSONAS[0];
    const currentUser = safeLocalStorage.getItem('amandigitalcare-currentUser');
    const userName = currentUser ? getUserName(currentUser) : t('utils.user_name.guest');
    return `You are Aman AI. Calm, empathetic voice. Context: ${userName}, Day ${context.day} of ${context.program}. Persona: ${selectedPersona.systemInstruction}`;
};

export const buildPreventionPlanSystemInstruction = (t: (key: string) => string): string | null => {
    const context = getUserContext();
    if (!context) return null;
    return `You are Aman AI, an expert recovery coach helping the user build a digital Relapse Prevention Plan.
    Your goal is to interview the user to populate 4 specific sections:
    1. My Core Motivation (why they want to recover)
    2. Triggers (people, places, emotions)
    3. Coping Strategies (tools they can use)
    4. Support Network (names and roles/numbers)

    Current Language: ${context.language}.
    
    CRITICAL INSTRUCTION FOR TOOL USE:
    - As soon as the user provides ANY information relevant to the 4 sections above, you MUST call the 'updatePlan' tool immediately.
    - Do not wait for the user to finish listing everything. Capture partial information as it comes.
    - For example, if the user says "I do it for my kids", call updatePlan({ myWhy: "My kids" }) immediately.
    - If the user lists triggers, call updatePlan({ triggers: [...] }) immediately.
    - Do not just verbally acknowledge the input (e.g., "That's a great motivation"). You MUST save it using the tool first.
    - This is a digital form filling exercise conducted via chat. The priority is saving the data.
    
    Initial Greeting to use: ${t('prevention_plan_page.initial_greeting')}`;
};

export const calculateMilestones = (data: { currentDay: number; journalStreak: number; completedChallenges: number }): Milestone[] => {
    const { currentDay, journalStreak, completedChallenges } = data;
    const achieved: Milestone[] = [];
    if (currentDay >= 1) achieved.push({ id: 'day_1', title: 'First Day Done', icon: '✅', description: 'Started the journey.' });
    if (journalStreak >= 7) achieved.push({ id: 'streak_7', title: 'Weekly Journaler', icon: '🔥', description: '7 days of reflection.' });
    if (completedChallenges >= 10) achieved.push({ id: 'challenge_10', title: 'Action Oriented', icon: '🎯', description: '10 challenges done.' });
    return achieved;
};

// --- ROBUST AUDIO ENGINE ---

export function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function decode(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

/**
 * Decodes raw 16-bit Little Endian PCM bytes into a Web Audio Buffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const sampleCount = data.byteLength / 2;
  const frameCount = sampleCount / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // 16-bit PCM is 2 bytes per sample. Little-endian = true.
      const byteOffset = (i * numChannels + channel) * 2;
      const int16Value = view.getInt16(byteOffset, true);
      // Map range [-32768, 32767] to [-1.0, 1.0]
      channelData[i] = int16Value / 32768.0;
    }
  }
  return buffer;
}

export function createBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Quantize Float32 [-1, 1] to Int16 [-32768, 32767]
    int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

let playbackAudioContext: AudioContext | null = null;
export const getPlaybackAudioContext = (sampleRate: number = 24000): AudioContext => {
    if (!playbackAudioContext || playbackAudioContext.state === 'closed') {
        playbackAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ 
          sampleRate 
        });
    }
    return playbackAudioContext;
};

/**
 * Robustly plays audio and ensures context is unlocked.
 */
export const playAndReturnAudio = async (
    base64Audio: string, 
    onEnded: () => void
): Promise<AudioBufferSourceNode> => {
    const audioContext = getPlaybackAudioContext(24000);
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const pcmBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(pcmBytes, audioContext, 24000, 1);
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    source.onended = () => {
        onEnded();
    };
    
    source.start(0);
    return source;
};

export const getAllUserData = (): { [key: string]: any } => {
    const data: { [key: string]: any } = {};
    const prefix = getScopedKey('').slice(0, -1);
    for (let i = 0; i < safeLocalStorage.length; i++) {
        const key = safeLocalStorage.key(i);
        if (key && key.startsWith(prefix)) {
            const cleanKey = key.replace(prefix, '').slice(1);
            try { data[cleanKey] = JSON.parse(safeLocalStorage.getItem(key)!); } 
            catch { data[cleanKey] = safeLocalStorage.getItem(key); }
        }
    }
    return data;
};

export const deleteAllUserData = (): void => {
    const prefix = getScopedKey('').slice(0, -1);
    const keysToDelete: string[] = [];
    for (let i = 0; i < safeLocalStorage.length; i++) {
        const key = safeLocalStorage.key(i);
        if (key && key.startsWith(prefix)) keysToDelete.push(key);
    }
    keysToDelete.forEach(key => safeLocalStorage.removeItem(key));
};
