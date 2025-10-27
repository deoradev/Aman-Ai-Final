
export interface Testimonial {
    id: number;
    quote: string;
    author: string;
    location: string;
}

export interface Resource {
    id: number;
    type: 'Article' | 'Exercise' | 'Guide';
    title: string;
    description: string;
    link: string;
}

export interface DailyChallenge {
    day: number;
    title: string;
    description: string;
    task: string;
}

export interface Program {
    id: string;
    name: string;
    description: string;
    successRate: number;
    features: string[];
    testimonial: Testimonial;
    dailyChallenges: DailyChallenge[];
}

export interface Persona {
    id: string;
    name: string;
    description: string;
    icon: string;
    systemInstruction: string;
}

export interface GroupSessionTopic {
    key: string;
    icon: string;
}

export interface RolePlayPersona {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
}

export interface ConversationPracticeScenario {
    id: string;
    title: string;
    description: string;
    personas: RolePlayPersona[];
    systemPrompt: string;
}

export interface MoodEntry {
    date: string; // YYYY-MM-DD
    mood: 'happy' | 'neutral' | 'sad';
}

export interface AIInsight {
    type: 'celebration' | 'suggestion' | 'reflection' | 'encouragement' | 'garden';
    title: string;
    text: string;
    action?: 'NAVIGATE_TOOLKIT' | 'NAVIGATE_GOALS' | 'NAVIGATE_RESOURCES';
    cta?: string;
}

export interface JournalEntry {
    date: string; // YYYY-MM-DD
    text: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
}

export interface Goal {
    id: number;
    text: string;
    completed: boolean;
}

export interface Milestone {
    id: string;
    title: string;
    icon: string;
    description: string;
}

export interface WellnessEntry {
    date: string; // YYYY-MM-DD
    sleepHours: number;
    activityLevel: 'low' | 'moderate' | 'high';
}

export interface PreventionPlan {
    triggers: string[];
    copingStrategies: string[];
    supportNetwork: { name: string, contactInfo: string }[];
    myWhy: string;
}

export interface CommunityPost {
    id: number;
    type: 'text' | 'hi' | 'voice' | 'photo';
    content?: string;
    timestamp: number;
}

export interface GroupSessionMessage {
    id: number;
    speaker: 'user' | 'moderator' | 'peer';
    author: string;
    text: string;
}

export interface EchoAffirmation {
    id: number;
    text: string;
    voice: string;
    audioDataB64: string;
}

export type ToolkitType = 'meditation' | 'cbt' | 'gratitude' | 'future_self' | 'nutrition';
