import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { MoodEntry, Resource, AIInsight, JournalEntry, ChatMessage, ToolkitType, DoctorReport } from '../types';
import { getUserContext } from "../utils";

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface AnalyticsData {
    programName: string;
    journalCount: number;
    challengeCount: number;
    moods: { happy: number; neutral: number; sad: number };
    challengeAndHappyDays: number;
    language: string;
}

export const getAnalyticsInsights = async (data: AnalyticsData): Promise<AIInsight[]> => {
    const prompt = `
    You are a compassionate and insightful AI recovery coach named Aman AI.
    Your task is to analyze the user's recent progress data (from the last 30 days) and provide 2-3 short, encouraging, and personalized insights.
    
    RULES:
    - BE POSITIVE AND ENCOURAGING. Frame insights around positive patterns and strengths.
    - DO NOT give medical advice.
    - Keep each insight to a single, easy-to-read sentence.
    - Respond ONLY in the user's specified language: ${data.language}.
    - For at least one insight, suggest a concrete, helpful action the user can take based on their data.
    - The entire response must be a valid JSON array of objects.
    
    USER DATA (last 30 days):
    - Program Name: ${data.programName}
    - Journal Entries Made: ${data.journalCount}
    - Challenges Completed: ${data.challengeCount}
    - Mood Distribution: Happy (${data.moods.happy} days), Neutral (${data.moods.neutral} days), Sad (${data.moods.sad} days)
    - Correlation Data: On ${data.challengeAndHappyDays} of the days when a challenge was completed, the user also reported feeling 'happy'.

    RESPONSE FORMAT:
    Respond with a JSON array where each object has "type", "title", "text", and optionally "action" and "cta".
    - "type": celebration, suggestion, reflection, or encouragement.
    - "title": A short, engaging title.
    - "text": The insight message (1-2 sentences).
    - "action" (optional): One of 'NAVIGATE_TOOLKIT', 'NAVIGATE_GOALS', 'NAVIGATE_RESOURCES'.
    - "cta" (optional): The button text for the action, e.g., "Try a Breathing Exercise" or "Set a New Goal".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            title: { type: Type.STRING },
                            text: { type: Type.STRING },
                            action: { type: Type.STRING, nullable: true },
                            cta: { type: Type.STRING, nullable: true }
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error getting analytics insights:", error);
        throw new Error("Failed to generate insights from AI.");
    }
};

export const getClinicalDoctorReport = async (
    moods: MoodEntry[],
    journals: JournalEntry[],
    programName: string,
    language: string
): Promise<DoctorReport> => {
    const journalText = journals.map(j => j.text).join("\n");
    const prompt = `
    Analyze the following recovery data for a medical professional. 
    Program: ${programName}
    Mood Logs: ${JSON.stringify(moods.slice(-30))}
    Journal Context: ${journalText.substring(0, 2000)}

    Generate a Clinical Summary for a physician or psychiatrist.
    Use professional medical terminology but remain observational.
    Focus on:
    1. Overall emotional stability.
    2. Recurring triggers mentioned in journals.
    3. Behavioral adherence (journaling frequency).
    
    RESPONSE FORMAT (JSON):
    {
        "summary": "High-level summary of patient state",
        "topTriggers": ["trigger 1", "trigger 2"],
        "moodTrend": "Narrative of mood changes",
        "concerns": ["Potential warning signs"],
        "positives": ["Strengths demonstrated"]
    }
    Respond ONLY in: ${language}.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        topTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
                        moodTrend: { type: Type.STRING },
                        concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
                        positives: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error generating doctor report:", error);
        throw error;
    }
};

export const getJournalReflection = async (journalText: string, language: string): Promise<string> => {
    const prompt = `
    You are Aman AI, an empathetic listening companion.
    A user just shared this journal entry with you:
    ---
    "${journalText}"
    ---
    Your task is to provide a single, short (20-35 words) reflection that is purely validating and empathetic.
    RULES:
    - DO NOT give advice or suggestions.
    - DO NOT ask questions.
    - Your goal is simply to make the user feel heard and understood.
    - Start your reflection with something like "Thank you for sharing that..." or "It sounds like...".
    - The response MUST be in the user's specified language: ${language}.
    - Respond ONLY with the text of the reflection, no extra formatting.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating journal reflection:", error);
        return "";
    }
};


export const generateToolkitExercise = async (
    toolkitType: ToolkitType,
    userInput: string
): Promise<string> => {
    const context = getUserContext();
    if (!context) {
        return Promise.reject(new Error("User context not found."));
    }

    const prompt = `
    You are Aman AI, a compassionate and skilled therapeutic AI.
    Your user needs a specific tool from their toolkit to help them in their recovery.

    USER CONTEXT:
    - Program: ${context.program}
    - Day: ${context.day} of 90
    - Language: ${context.language}
    - Age: ${context.age || 'Not provided'}
    - Gender: ${context.gender || 'Not provided'}

    TOOLKIT REQUEST: ${toolkitType}
    USER INPUT: "${userInput}"

    TASK: Generate a helpful, structured response based on the request.
    - If the request is 'meditation': Write a short (200-300 words) guided meditation script based on the user's stated feeling. Use calming, gentle language. Structure it with clear paragraphs for pauses. Start with a title like "**A Short Meditation for [Feeling]**".
    - If the request is 'cbt': Write a step-by-step cognitive reframing exercise based on the user's negative thought. Guide them through identifying the thought, gently questioning the evidence for and against it, and finding an alternative, more balanced thought. Use a supportive, Socratic questioning style. Start with a title like "**Reframing the Thought: '[User's Thought]'**".
    - If the request is 'gratitude': Write a single, insightful, and unique journal prompt designed to evoke feelings of gratitude. Do not just ask for a list (e.g., "List 3 things..."). Instead, ask for a deeper reflection on a single experience or person. The prompt should be creative and thought-provoking. Start with a title like "**A Moment for Gratitude**".
    - If the request is 'future_self': Write a detailed, multi-sensory guided imagery script (300-400 words) based on the user's stated goal. The script should walk them through achieving and experiencing this goal, describing what they see, hear, and feel. Use calming, second-person ("You are...") language. The script must be only the spoken text, without a title, to be used for audio generation.
    - If the request is 'nutrition': Act as a wellness coach. Generate simple, actionable meal ideas and nutritional tips based on the user's request and their age (${context.age}) and gender (${context.gender}). If age or gender are not available, provide general advice. Structure the response with markdown (headings, lists). ALWAYS include this exact disclaimer at the end, on its own line: "**Disclaimer:** This is not medical advice. Please consult a healthcare professional for personalized nutritional guidance." Start with a title like "**Nutrition Tips for: [User's Request]**".

    RESPONSE FORMAT:
    - Use markdown for structure where applicable (CBT, Nutrition, Meditation, Gratitude).
    - For 'future_self', provide only the raw script text for text-to-speech. No titles or markdown.
    - The tone must be empathetic, supportive, and aligned with the principles of addiction recovery.
    - The response MUST be entirely in the user's specified language: ${context.language}.
    - Do not include any introductory or concluding conversational text like "Here is your exercise..." or "I hope this helps." Just provide the generated content directly.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error(`Error generating toolkit exercise (${toolkitType}):`, error);
        throw new Error("Failed to generate exercise from AI.");
    }
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName },
                    },
                },
            },
        });
        
        // CRITICAL FIX: Do not use response.text. 
        // Iterate candidates to find the inlineData part containing base64 PCM.
        const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        const base64Audio = audioPart?.inlineData?.data;
        
        if (!base64Audio) {
            throw new Error("No audio data returned from API candidates.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech from AI.");
    }
};

export const getConversationFeedback = async (
    transcript: { speaker: 'user' | 'model', text: string }[],
    scenarioTitle: string,
    personaName: string,
    language: string
): Promise<string> => {
    const transcriptString = transcript.map(msg => `${msg.speaker === 'user' ? 'User' : 'AI'}: ${msg.text}`).join('\n');

    const prompt = `
    You are Aman AI, an expert and deeply empathetic recovery coach. Your task is to provide constructive feedback on a role-play conversation the user just had.

    THE SCENARIO: The user was practicing "${scenarioTitle}".
    THE AI's ROLE: The AI was playing the part of "${personaName}".
    THE CONVERSATION:
    ---
    ${transcriptString}
    ---

    YOUR TASK:
    Analyze the transcript and provide feedback in two sections, formatted using Markdown.
    1.  **What Went Well**: Identify specific things the user said or did that were positive, strong, or healthy. Use direct quotes if helpful. Be encouraging and celebratory.
    2.  **Things to Try Next Time**: Offer gentle, actionable suggestions for improvement. Frame these as alternative approaches, not criticisms. For example, instead of "You were too aggressive," say "Another approach could be to use an 'I' statement, like...".

    RULES:
    - Your tone must be supportive, encouraging, and non-judgmental.
    - Keep the feedback concise and easy to understand.
    - Use Markdown for formatting (e.g., "**Bold Headings**", "* lists").
    - Respond ONLY with the feedback text, in the user's specified language: ${language}.
    - Do not include any conversational intro/outro like "Here is your feedback...".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting conversation feedback:", error);
        throw new Error("Failed to generate feedback from AI.");
    }
};

interface SponsorInsightData {
    moods: MoodEntry[];
    journalEntries: JournalEntry[];
    journalStreak: number;
    completedChallenges: number;
    currentDay: number;
    userName: string;
    language: string;
}

export const getSponsorInsight = async (data: SponsorInsightData): Promise<AIInsight> => {
    const journalSummary = await summarizeRecentJournals(data.journalEntries.slice(-3), data.language);

    const prompt = `
    You are Aman AI, a proactive, persistent, and deeply empathetic AI Sober Sponsor.
    Your task is to generate a single, personalized, and supportive insight for the user's dashboard based on their recent activity.
    You are speaking directly to the user.

    RULES:
    - **Persona**: You are caring, observant, and encouraging. You remember past events.
    - **Continuity**: Use the "Recent Journal Summary" to reference specific things the user mentioned. This is crucial. For example, if they mentioned being nervous about something, ask how it went.
    - **Prioritize**: Base your insight on the most important piece of recent data.
        1.  **Consecutive Sad Moods**: If the user has logged 'sad' for 2+ days, this is the top priority. Offer gentle support and suggest a tool.
        2.  **Journal Content**: If the journal summary reveals a specific struggle or success, comment on that.
        3.  **Garden Insight**: If the user has a high journal streak (>= 7) or has completed many challenges (>=10), you can generate a 'garden' type insight. Relate their progress to their virtual garden's growth metaphorically.
        4.  **Milestones**: If the user has a high journal streak (e.g., >= 3), celebrate it as a 'celebration'.
        5.  **Default**: If there's little data, provide a general, warm, encouraging message for the day.
    - **Format**: Respond with a JSON object containing "type", "title", and "text".
        - "type": celebration, suggestion, reflection, encouragement, or garden.
        - "title": A personal title, like "A Morning Thought" or "Checking In".
        - "text": The supportive message for the user (30-50 words). Address the user by name if it feels natural.

    ---
    USER CONTEXT:
    - Name: ${data.userName}
    - Recent Moods (last 3): ${data.moods.slice(-3).map(m => m.mood).join(', ') || 'None'}
    - Current Journal Streak: ${data.journalStreak} days
    - Growth Garden Status: The stem represents day ${data.currentDay}/90. It has ${Math.floor(data.completedChallenges / 2)} leaves and ${Math.floor(data.journalStreak / 7)} flowers.
    - Recent Journal Summary: "${journalSummary}"
    - Language to respond in: ${data.language}
    ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        title: { type: Type.STRING },
                        text: { type: Type.STRING }
                    },
                    required: ["type", "title", "text"]
                }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error getting sponsor insight:", error);
        return {
            type: 'encouragement',
            title: 'A Gentle Reminder',
            text: 'Remember to be kind to yourself today. Every step forward, no matter how small, is progress.'
        };
    }
};

export const generateNotificationMessage = async (type: 'morning' | 'journal_nudge', language: string): Promise<string> => {
    const prompt = `
    You are Aman AI, a caring Sober Sponsor. Your task is to generate a single, short, and encouraging push notification message (under 20 words).
    - If the type is 'morning', write a positive and gentle message to start the day.
    - If the type is 'journal_nudge', write a gentle, no-pressure reminder to journal in the evening.
    - Respond ONLY with the notification text, in the user's specified language: ${language}.
    - Do not include any titles or labels.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating notification message:", error);
        return "";
    }
};

export const getSuggestedResource = async (journalText: string, programName: string, availableResources: Resource[], language: string): Promise<Resource | null> => {
    const resourcesString = availableResources.map(r => `ID: ${r.id}, Title: "${r.title}", Description: "${r.description}"`).join('\n');
    
    const prompt = `
    You are Aman AI, an intelligent recovery assistant.
    Your user is in the "${programName}" program and just wrote the following journal entry.
    Your task is to analyze the entry and recommend ONE of the following available resources that would be most helpful.
    
    USER's JOURNAL ENTRY:
    ---
    ${journalText}
    ---
    
    AVAILABLE RESOURCES:
    ---
    ${resourcesString}
    ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.NUMBER }
                    }
                }
            }
        });
        const parsed = JSON.parse(response.text.trim());
        if (parsed.id) {
            return availableResources.find(r => r.id === parsed.id) || null;
        }
        return null;
    } catch (error) {
        console.error("Error getting suggested resource:", error);
        return null;
    }
};

export interface GroupSessionResponse {
    moderatorResponse: string;
    simulatedPeerResponses: { author: string; text: string }[];
}

export const getGroupSessionResponse = async (userMessage: string, topicTitle: string, language: string): Promise<GroupSessionResponse> => {
    const prompt = `
    You are a moderator for an anonymous online recovery group named Aman AI. The topic is "${topicTitle}".
    A user just shared the following message.
    
    USER MESSAGE: "${userMessage}"
    
    YOUR TASK:
    Respond with a JSON object containing two keys: "moderatorResponse" and "simulatedPeerResponses".
    `;

     try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        moderatorResponse: { type: Type.STRING },
                        simulatedPeerResponses: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    author: { type: Type.STRING },
                                    text: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error in group session response generation:", error);
        return {
            moderatorResponse: "I'm sorry, I'm having a little trouble at the moment.",
            simulatedPeerResponses: []
        };
    }
};

export const findSoberFriendlyPlaces = async (query: string, location: { latitude: number; longitude: number }): Promise<GenerateContentResponse> => {
    const prompt = `
        A user in recovery is looking for sober-friendly places or activities near them.
        Based on their request, find relevant places using Google Maps.
        User's request: "${query}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: location.latitude,
                            longitude: location.longitude
                        }
                    }
                }
            },
        });
        return response;
    } catch (error) {
        console.error("Error finding sober-friendly places:", error);
        throw new Error("Failed to find places using AI.");
    }
};

export const summarizeRecentJournals = async (entries: JournalEntry[], language: string): Promise<string> => {
    if (entries.length === 0) {
        return "User has not written any journal entries recently.";
    }
    const recentEntriesText = entries.map(e => `Date: ${e.date}\nEntry: "${e.text}"`).join('\n---\n');

    const prompt = `
    You are an expert psychological analyst creating a concise "memory" summary for a companion AI named Aman.
    Analyze the following recent journal entries from a user in recovery.
    Respond ONLY with the summary text, in the user's specified language: ${language}.

    RECENT JOURNAL ENTRIES:
    ---
    ${recentEntriesText}
    ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing journals:", error);
        return "Could not retrieve user data summary.";
    }
};

export const summarizeChatHistory = async (messages: ChatMessage[], language: string): Promise<string> => {
    if (messages.length === 0) {
        return "No recent conversation history.";
    }
    const transcript = messages.slice(-20).map(m => `${m.role}: ${m.text}`).join('\n');

    const prompt = `
    You are an expert psychological analyst creating a concise "memory" summary for a companion AI named Aman.
    Synthesize your analysis into a dense, third-person summary of about 60-80 words.
    Respond ONLY with the summary text, in the user's specified language: ${language}.

    CONVERSATION TRANSCRIPT:
    ---
    ${transcript}
    ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing chat history:", error);
        return "Could not summarize chat history.";
    }
};