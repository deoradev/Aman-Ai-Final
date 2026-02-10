import { ai } from './geminiService';

/**
 * Translates an entire JSON object of strings to a target language using the Gemini API,
 * with localStorage caching for performance.
 * @param source The source JSON object with English strings.
 * @param targetLanguage The language to translate to (e.g., 'es', 'fr', 'yi').
 * @returns A promise that resolves to the translated JSON object.
 */
export const translateAll = async (source: object, targetLanguage: string): Promise<any> => {
    const cacheKey = `amandigitalcare-translation-${targetLanguage}`;

    try {
        const cachedTranslation = localStorage.getItem(cacheKey);
        if (cachedTranslation) {
            // NOTE: This basic cache doesn't check if the source `en.json` has changed.
            // For a production app, a versioning system would be needed to invalidate old caches.
            return JSON.parse(cachedTranslation);
        }
    } catch (e) {
        console.error("Could not read from translation cache", e);
    }

    const prompt = `
    You are an expert translation service. Your task is to translate the values of the following JSON object into the specified target language.
    
    RULES:
    1.  Translate ALL string values.
    2.  Preserve the exact JSON structure, including all keys and nesting.
    3.  Do not translate the keys themselves, only the string values.
    4.  For strings containing placeholders like "{name}" or "{count}", keep these placeholders exactly as they are in the translated string.
    5.  Respond ONLY with the translated JSON object. Do not include any extra text, explanations, or markdown code fences like \`\`\`json. Your entire response must be a single, valid JSON object.

    TARGET LANGUAGE: ${targetLanguage}

    JSON TO TRANSLATE:
    ${JSON.stringify(source, null, 2)}
    `;

    try {
        // Fix: Updated model name to gemini-3-flash-preview as per guidelines
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        // Fix: Safely access .text property and ensure it's not treated as a method
        const jsonText = response.text?.trim() || "{}";
        const translatedJson = JSON.parse(jsonText);
        
        try {
            localStorage.setItem(cacheKey, JSON.stringify(translatedJson));
        } catch (e) {
            console.error("Could not write to translation cache", e);
            // This might happen if localStorage is full. The app will still work.
        }

        return translatedJson;

    } catch (error) {
        console.error(`Error translating content to ${targetLanguage} with Gemini:`, error);
        throw new Error("Failed to translate language pack.");
    }
};