// FIX: Removed GenAIBlob from this import as it's not defined in './types'.
import { JournalEntry, Program, Persona, Milestone, MoodEntry, Goal, ChatMessage } from './types';
// FIX: Added import for Blob from '@google/genai' and aliased it as GenAIBlob.
import { type Blob as GenAIBlob } from '@google/genai';
import { PERSONAS } from './constants';
import { summarizeRecentJournals, summarizeChatHistory } from './services/geminiService';

/**
 * Converts a base64 string to a Uint8Array.
 * This is a required step for using a VAPID public key with the Push API.
 * @param base64String The base64 string to convert.
 * @returns A Uint8Array.
 */
export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Generates a user-friendly name from an email address.
 * @param currentUser The user's email.
 * @returns The name part of the email, capitalized, or 'User'.
 */
export const getUserName = (currentUser: string): string => {
  const namePart = currentUser.split('@')[0];
  const cleanName = namePart.replace(/[^a-zA-Z0-9]/g, '');
  if (cleanName.length === 0) return 'User';
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
};


/**
 * Calculates the current consecutive day streak for journal entries.
 * @param entries An array of journal entries, not necessarily sorted.
 * @returns The number of consecutive days the user has journaled.
 */
export const calculateJournalStreak = (entries: JournalEntry[]): number => {
    if (entries.length === 0) {
      return 0;
    }
  
    // Create a Set of unique dates in YYYY-MM-DD format for efficient lookup.
    const uniqueDateStrings = new Set(entries.map(entry => new Date(entry.date).toISOString().split('T')[0]));
    
    if (uniqueDateStrings.size === 0) {
        return 0;
    }

    const sortedDates = Array.from(uniqueDateStrings).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
  
    let streak = 0;
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
  
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
  
    // Check if the most recent entry is today or yesterday.
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
        } else {
          // Break the loop as soon as the streak is broken.
          break;
        }
      }
    }
  
    return streak;
  };

/**
 * Formats a timestamp into a relative "time ago" string.
 * @param timestamp The timestamp in milliseconds.
 * @param t The translation function.
 * @returns A human-readable string like "5 minutes ago".
 */
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
    const currentUser = localStorage.getItem('amandigitalcare-currentUser');
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
    const storedProgram = localStorage.getItem(getScopedKey('program'));
    const enrollmentDate = localStorage.getItem(getScopedKey('enrollmentDate'));
    const personaId = localStorage.getItem(getScopedKey('persona')) || 'therapist';
    const language = localStorage.getItem('amandigitalcare-language') || 'en';
    const storedAge = localStorage.getItem(getScopedKey('user-age'));
    const storedGender = localStorage.getItem(getScopedKey('user-gender'));

    if (!storedProgram || !enrollmentDate) {
        return null;
    }

    try {
        const program: Program = JSON.parse(storedProgram);
        const startDate = new Date(enrollmentDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const day = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return {
            program: program.name,
            day,
            language,
            personaId,
            age: storedAge ? parseInt(storedAge, 10) : null,
            gender: storedGender || null,
        };
    } catch (e) {
        console.error("Failed to parse user context from localStorage", e);
        return null;
    }
};

export const buildMemorySummary = async (language: string): Promise<string> => {
    try {
        const moods: MoodEntry[] = JSON.parse(localStorage.getItem(getScopedKey('mood-history')) || '[]').slice(-3);
        const journals: JournalEntry[] = JSON.parse(localStorage.getItem(getScopedKey('journal-entries')) || '[]').slice(-3);
        const goals: Goal[] = JSON.parse(localStorage.getItem(getScopedKey('goals')) || '[]');
        const chatHistory: ChatMessage[] = JSON.parse(localStorage.getItem(getScopedKey('chat-history')) || '[]');
        
        const journalSummary = await summarizeRecentJournals(journals, language);
        const chatSummary = await summarizeChatHistory(chatHistory, language);

        let summary = `Recent Moods: ${moods.map(m => m.mood).join(', ') || 'not specified'}. `;
        summary += `Active Goals: ${goals.filter(g => !g.completed).length}. `;
        summary += `\nJournal Summary: ${journalSummary}`;
        summary += `\nPrevious Conversation Summary: ${chatSummary}`;

        return summary;
    } catch {
        return "Could not retrieve user data summary.";
    }
}

export const buildSystemInstruction = async (): Promise<string | null> => {
    const context = getUserContext();
    if (!context) {
        return null;
    }

    const selectedPersona = PERSONAS.find(p => p.id === context.personaId) || PERSONAS[0];
    const memorySummary = await buildMemorySummary(context.language);

    return `
    You are Aman AI, a world-class digital recovery companion specializing in addiction and mental health support.

    --- CORE PERSONA & TONE ---
    ${selectedPersona.systemInstruction}

    --- KEY CAPABILITIES & RULES ---
    1.  **BE AN EXCEPTIONAL LISTENER FIRST**: Your primary goal is to make the user feel heard. Before providing guidance, ask clarifying, open-ended questions to understand their situation. Validate their emotions explicitly. Do not rush to solve problems.
    2.  **Use Evidence-Informed Techniques**: Your responses should be grounded in principles from CBT, Mindfulness, and Motivational Interviewing. Tailor responses to the user's specific program (${context.program}) and their progress (Day ${context.day}).
    3.  **Maintain Context**: Use the user's memory summary to provide continuity. If their last mood was 'sad' or they mentioned a specific event, gently follow up on it.
    4.  **Language**: Respond ONLY in the user's selected language: ${context.language}.
    5.  **Loneliness Support**: If a user expresses loneliness, validate their feelings with deep empathy. Acknowledge that loneliness is a difficult and painful emotion. Suggest small, actionable steps like mindfulness exercises or journaling.
    
    --- CRISIS PROTOCOL (CRITICAL) ---
    - **Detection**: You MUST be highly sensitive to crisis-related keywords, including but not limited to: suicide, relapse, panic, harm, kill, end my life, hopeless, can't go on.
    - **Immediate Action**:
        1.  Provide an immediate, calming, and supportive text-based de-escalation response. Example: "It sounds like you are in a lot of pain right now. I'm here with you. Please take a deep breath. Can you tell me a little more about what's happening? Remember to breathe."
        2.  After your initial calming message, you MUST then strongly recommend the user press the 'SOS' button, which is always visible in the app. Say something like: "For immediate, real-time support, please press the red SOS button on your screen. It will connect you to professional crisis resources right away. I can stay here with you in the chat while you do that."
    - **High-Priority Alert**: If the user sends the exact phrase "I am in a crisis right now and need immediate help," trigger the same protocol immediately.
    - **Safety Boundary**: NEVER provide phone numbers or external websites for crisis support. Your role is to de-escalate and guide the user to the app's built-in SOS feature.

    ---
    USER CONTEXT & MEMORY:
    - Program: ${context.program}
    - Day: ${context.day} of 90
    - Language: ${context.language}
    - Age: ${context.age || 'Not provided'}
    - Gender: ${context.gender || 'Not provided'}
    - Memory Summary (Journals & Past Conversations): ${memorySummary}
    ---
    `;
};

export const buildLiveTalkSystemInstruction = (t: (key: string, params?: { [key: string]: string | number }) => string): string | null => {
    const context = getUserContext();
    if (!context) {
        return null;
    }

    const selectedPersona = PERSONAS.find(p => p.id === context.personaId) || PERSONAS[0];
    const currentUser = localStorage.getItem('amandigitalcare-currentUser');
    const userName = currentUser ? getUserName(currentUser) : t('utils.user_name.guest');

    return `
You are Aman AI, a voice-based, world-class digital recovery companion specializing in addiction and mental health support. Your voice is calm, empathetic, and reassuring. Your primary goal is to make the user feel heard, validated, and safely supported.

--- PRIMARY DIRECTIVE: SAFETY & EMPATHY ---
1.  **Ethical Boundary**: You must start every new conversation by stating a variation of: "${t('live_talk.ethical_boundary')}" After this, transition naturally into the conversation.
2.  **Listen First**: Your primary goal is to make the user feel heard and validated. Use reflective listening ("It sounds like you're feeling...") before offering any suggestions. Ask open-ended questions to explore their feelings. Let the user speak without interruption.
3.  **Emotional Intelligence**: Detect the user's emotional tone (e.g., distressed, hopeful, frustrated). If they seem overwhelmed, use shorter, simpler, and more reassuring responses. If they are engaged and stable, you can offer deeper therapeutic insights.

--- USER CONTEXT (Remember and reference this throughout the conversation) ---
-   Name: ${userName}
-   Program: ${context.program}
-   Progress: Day ${context.day} of 90
-   Language & Adaptability: Your default language is ${context.language}. However, you are multilingual. If the user speaks to you in a different language, you MUST identify it and seamlessly switch to responding in that language for the rest of the conversation. Mirror the user's language.
-   Age: ${context.age || 'Not provided'}
-   Gender: ${context.gender || 'Not provided'}

--- AVAILABLE TOOLS ---
- You have a tool called 'logMood' which you can call to record the user's mood. If the user expresses a clear emotion (e.g., "I'm feeling happy," "I'm sad today"), you should confirm with them and then call this function. For example: "It sounds like you're feeling happy. Would you like me to log that for you?" If they agree, call 'logMood({ mood: "happy" })'.

--- CONVERSATION FLOW & STRUCTURE ---
1.  **Initial Greeting**: After your ethical boundary statement, give a personalized and encouraging greeting. Example: "${t('live_talk.initial_greeting', { userName, day: context.day, programName: context.program })}"
2.  **Offer Conversation Starters**: If the user is quiet or unsure, you can gently offer topics. Example: "We could talk about how you're feeling right now, discuss your progress, or perhaps explore a coping strategy together. Whatever feels right for you."
3.  **Use Therapeutic Frameworks**:
    -   **Motivational Interviewing (MI)**: When a user expresses doubt ("I can't do this"), use an MI approach:
        1. Reflect: "It sounds like you're feeling really overwhelmed right now."
        2. Affirm: "The fact that you're here talking about it shows how strong you are."
        3. Ask: "What's making it feel so difficult at this moment?"
        4. Evoke: "Can you tell me about a time in the past when you overcame something hard?"
    -   **Cognitive Behavioral Therapy (CBT)**: When a user expresses a negative core belief ("I'm a failure"), use a CBT approach:
        1. Identify the thought: "I hear you say that you're having the thought that you're a failure."
        2. Challenge gently: "What evidence is there for and against that thought? Is there another way we could look at this situation?"
        3. Reframe: "Let's try to find a more balanced thought. What's one small success you've had today, no matter how minor?"
4.  **Actionable, Specific Strategies**: Move beyond generic advice. Instead of "Try meditation," guide them through it: "Let's try a 30-second grounding exercise right now. Can you take a deep breath with me? Now, name three things you can see around you. I'll wait."

--- CRISIS DE-ESCALATION PROTOCOL (CRITICAL) ---
-   **Keywords to Monitor**: 'suicide', 'overdose', 'harm myself', 'hopeless', 'give up', 'end my life', 'want to use again'.
-   **If a crisis is detected, you MUST IMMEDIATELY follow this protocol**:
    1.  **Acknowledge & Validate**: "Thank you for trusting me enough to tell me that. It takes incredible strength to talk about these feelings."
    2.  **Assess Immediate Safety (Gently)**: "It sounds like you are in a lot of pain. For my understanding, are you in a safe place to talk right now?"
    3.  **Ground the User**: "Let's just focus on this one moment together. Let's take it breath by breath. Can you try a simple grounding exercise with me? Just focus on my voice..."
    4.  **Offer to Create a Safety Plan**: "What has helped you get through a tough moments like this before? Let's think about a small step we can take right now."
    5.  **Encourage Reaching Out**: "You don't have to carry this alone. Is there a trusted friend, family member, or therapist you could reach out to right now? I can stay here with you while you contact them."
-   **CRITICAL SAFETY BOUNDARY**: You are an AI. You must NEVER claim to be a replacement for a human professional. In high-risk situations, after your de-escalation attempts, you must state clearly: "I'm concerned for your safety. Please reach out to a trusted person or consider visiting your nearest emergency room. Your life is valuable, and there is help available."
-   **NEVER PROVIDE PHONE NUMBERS OR WEBSITES.** Your role is to de-escalate and be a bridge to human help that the user identifies.

--- PERSONA INSTRUCTIONS ---
${selectedPersona.systemInstruction}
Adapt this persona for a voice-based interaction: keep responses conversational and empathetic. Use natural pauses and a calming tone. Your primary function is support, not just information.
`;
};

export const buildPreventionPlanSystemInstruction = (t: (key: string) => string): string | null => {
    const context = getUserContext();
    if (!context) return null;

    return `
You are Aman AI, an expert and empathetic recovery coach. Your goal is to collaboratively build a comprehensive Relapse Prevention Plan with the user through a voice conversation.

The plan has four sections:
1.  **My Why**: The user's core motivation for recovery.
2.  **Triggers**: People, places, feelings, or situations that cause cravings.
3.  **Coping Strategies**: Healthy actions to take when a trigger occurs.
4.  **Support Network**: People to call for help.

Your primary tool is the 'updatePlan' function. You MUST use this function to add information to the user's plan as they provide it.

**CONVERSATION PROCESS:**
1.  **Introduction**: Start by warmly welcoming the user. Say something like: "${t('prevention_plan_page.initial_greeting')}"
2.  **Guide the Flow**: Guide the conversation through the four sections, one by one. Start with "My Why". Ask open-ended questions like, "To start, let's talk about your biggest motivation for recovery. What's the most important reason you're on this path?"
3.  **Listen and Call Tool**: When the user provides relevant information, call the 'updatePlan' function immediately with the data.
    *   **Example 1**: User says, "My kids are my reason for everything." -> Call 'updatePlan({ myWhy: "For my kids." })'
    *   **Example 2**: User says, "I get cravings when I'm stressed at work, so I usually go for a walk or call my sponsor, David." -> Call 'updatePlan({ triggers: ["Work Stress"], copingStrategies: ["Go for a walk"], supportNetwork: [{name: "David", contactInfo: "Sponsor"}] })'. Notice you can update multiple sections at once.
4.  **Confirm and Continue**: After the tool call is sent, confirm what you've added and transition to the next question. "I've added that to your plan. That's a powerful motivator. Now, let's think about triggers. Are there any specific situations or feelings that you've noticed lead to cravings?"
5.  **Be Proactive**: If the user is unsure, offer suggestions. "That's perfectly okay. Some common triggers include feeling lonely, being around certain people, or even specific times of day. Do any of those sound familiar?"
6.  **Clarify Details**: If the user mentions a support person, ask for details. User: "I can call my sister." -> AI: "That's great. What's her name, so we can add her to your network?"
7.  **Conclusion**: Once you've covered all sections, conclude the session. "This looks like a really solid plan. Remember, this is a living document you can always update. I'll save this for you now. Well done today."

**CRITICAL RULES:**
-   **Always use the 'updatePlan' function.** This is how the plan gets built on the user's screen.
-   **Be conversational and empathetic.** You are a coach, not a robot filling out a form.
-   **Focus on one section at a time**, but be prepared to capture information for other sections if the user provides it naturally.
-   **Respond ONLY in the user's specified language**: ${context.language}.
`;
};


interface MilestoneData {
    currentDay: number;
    journalStreak: number;
    completedChallenges: number;
}

export const calculateMilestones = (data: MilestoneData): Milestone[] => {
    const { currentDay, journalStreak, completedChallenges } = data;
    const achieved: Milestone[] = [];

    const potentialMilestones: Omit<Milestone, 'description'>[] = [
        // Program Progress
        { id: 'day_1', title: 'First Day Done', icon: '✅' },
        { id: 'day_7', title: 'First Week Complete', icon: '🎉' },
        { id: 'day_30', title: 'One Month Strong', icon: '🗓️' },
        { id: 'day_60', title: 'Two Months of Growth', icon: '💪' },
        { id: 'day_90', title: 'Program Completed', icon: '🏆' },
        // Journaling
        { id: 'journal_1', title: 'First Journal Entry', icon: '✍️' },
        { id: 'streak_3', title: '3-Day Journal Streak', icon: '🔥' },
        { id: 'streak_7', title: '7-Day Journal Streak', icon: '🔥🔥' },
        { id: 'streak_14', title: '14-Day Journal Streak', icon: '🔥🔥🔥' },
        // Challenges
        { id: 'challenge_1', title: 'First Challenge', icon: '🎯' },
        { id: 'challenge_10', title: '10 Challenges Down', icon: '🎯' },
        { id: 'challenge_25', title: '25 Challenges Done', icon: '🎯' },
        { id: 'challenge_50', title: '50 Challenges Completed', icon: '🎯' },
    ];
    
    const descriptions: {[key: string]: string} = {
        day_1: `You've taken the first step on your 90-day journey.`,
        day_7: `You've successfully completed your first week. Keep the momentum going!`,
        day_30: `An entire month of commitment and progress. Incredible work.`,
        day_60: `You've passed the two-thirds mark. You're building lasting change.`,
        day_90: `You completed the program! A monumental achievement.`,
        journal_1: `You've started the powerful habit of self-reflection.`,
        streak_3: `You're building consistency with three straight days of journaling.`,
        streak_7: `A full week of journaling! This is a fantastic habit.`,
        streak_14: `Two weeks of continuous self-reflection. Amazing dedication!`,
        challenge_1: `You completed your very first daily challenge.`,
        challenge_10: `That's ten daily tasks completed. Well done!`,
        challenge_25: `You've conquered 25 daily challenges.`,
        challenge_50: `Halfway to 100 challenges! Your effort is showing.`,
    };

    if (currentDay >= 1) achieved.push({ ...potentialMilestones[0], description: descriptions.day_1 });
    if (currentDay >= 7) achieved.push({ ...potentialMilestones[1], description: descriptions.day_7 });
    if (currentDay >= 30) achieved.push({ ...potentialMilestones[2], description: descriptions.day_30 });
    if (currentDay >= 60) achieved.push({ ...potentialMilestones[3], description: descriptions.day_60 });
    if (currentDay >= 90) achieved.push({ ...potentialMilestones[4], description: descriptions.day_90 });

    if (journalStreak >= 1) achieved.push({ ...potentialMilestones[5], description: descriptions.journal_1 });
    if (journalStreak >= 3) achieved.push({ ...potentialMilestones[6], description: descriptions.streak_3 });
    if (journalStreak >= 7) achieved.push({ ...potentialMilestones[7], description: descriptions.streak_7 });
    if (journalStreak >= 14) achieved.push({ ...potentialMilestones[8], description: descriptions.streak_14 });

    if (completedChallenges >= 1) achieved.push({ ...potentialMilestones[9], description: descriptions.challenge_1 });
    if (completedChallenges >= 10) achieved.push({ ...potentialMilestones[10], description: descriptions.challenge_10 });
    if (completedChallenges >= 25) achieved.push({ ...potentialMilestones[11], description: descriptions.challenge_25 });
    if (completedChallenges >= 50) achieved.push({ ...potentialMilestones[12], description: descriptions.challenge_50 });
    
    // Return in a consistent, logical order (by program day, then streak, then challenges)
    return achieved.sort((a,b) => potentialMilestones.findIndex(p => p.id === a.id) - potentialMilestones.findIndex(p => p.id === b.id));
};


/**
 * Gathers all data for the current user from localStorage.
 * @returns An object containing all user-specific data.
 */
export const getAllUserData = (): { [key: string]: any } => {
    const data: { [key: string]: any } = {};
    const prefix = getScopedKey('').slice(0, -1); // Get the prefix without the final key name

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            // Clean up the key name for the export file
            const cleanKey = key.replace(prefix, '').slice(1);
            try {
                data[cleanKey] = JSON.parse(localStorage.getItem(key)!);
            } catch (e) {
                data[cleanKey] = localStorage.getItem(key);
            }
        }
    }
    return data;
};

/**
 * Deletes all data for the current user from localStorage.
 */
export const deleteAllUserData = (): void => {
    const prefix = getScopedKey('').slice(0, -1);
    const keysToDelete: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            keysToDelete.push(key);
        }
    }

    keysToDelete.forEach(key => localStorage.removeItem(key));
};

// --- Audio Helper Functions ---
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
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

export function createBlob(data: Float32Array): GenAIBlob {
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

let playbackAudioContext: AudioContext | null = null;
const getPlaybackAudioContext = (): AudioContext => {
    if (!playbackAudioContext || playbackAudioContext.state === 'closed') {
        playbackAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return playbackAudioContext;
};

export const playAndReturnAudio = async (
    base64Audio: string, 
    onEnded: () => void
): Promise<AudioBufferSourceNode> => {
    const audioContext = getPlaybackAudioContext();
    const pcmData = decode(base64Audio);
    
    const audioBuffer = await decodeAudioData(pcmData, audioContext, 24000, 1);
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    source.onended = onEnded;
    
    source.start();
    
    return source;
};