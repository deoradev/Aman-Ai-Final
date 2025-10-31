import { Program, Resource, Persona, GroupSessionTopic, RolePlayPersona, ConversationPracticeScenario, DailyChallenge } from './types';

// This is a placeholder public VAPID key.
// For a real production deployment, you MUST generate your own VAPID key pair
// and securely store the private key on your server.
export const VAPID_PUBLIC_KEY = 'BC772SRi-p__pY3yH_w_VT_PJxk_xYkpl5-i2sIUhqM9x52g1I6h2-tWTz3sZEATbQ7vj-RIw2w_OMhdhVf3LgM';

export const COMMON_LANGUAGES: { [key: string]: string } = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  hi: 'हिन्दी',
  zh: '中文',
  ja: '日本語',
  ar: 'العربية',
  ru: 'Русский',
  pt: 'Português',
};

export const ALL_LANGUAGES: { code: string; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ur', name: 'اردو' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'mr', name: 'मराठी' },
    { code: 'ar', name: 'العربية' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ru', name: 'Русский' },
    { code: 'pt', name: 'Português' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'sq', name: 'Shqip' },
    { code: 'am', name: 'አማርኛ' },
    { code: 'hy', name: 'Հայերեն' },
    { code: 'az', name: 'Azərbaycan' },
    { code: 'eu', name: 'Euskara' },
    { code: 'be', name: 'беларускі' },
    { code: 'bs', name: 'Bosanski' },
    { code: 'bg', name: 'български' },
    { code: 'ca', name: 'Català' },
    { code: 'ceb', name: 'Cebuano' },
    { code: 'ny', name: 'Chichewa' },
    { code: 'co', name: 'Corsu' },
    { code: 'hr', name: 'Hrvatski' },
    { code: 'cs', name: 'Čeština' },
    { code: 'da', name: 'Dansk' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'eo', name: 'Esperanto' },
    { code: 'et', name: 'Eesti' },
    { code: 'tl', name: 'Filipino' },
    { code: 'fi', name: 'Suomi' },
    { code: 'fy', name: 'Frysk' },
    { code: 'gl', name: 'Galego' },
    { code: 'ka', name: 'ქართული' },
    { code: 'el', name: 'Ελληνικά' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'ht', name: 'Kreyòl Ayisyen' },
    { code: 'ha', name: 'Hausa' },
    { code: 'haw', name: 'ʻŌlelo Hawaiʻi' },
    { code: 'iw', name: 'עברית' },
    { code: 'hmn', name: 'Hmoob' },
    { code: 'hu', name: 'Magyar' },
    { code: 'is', name: 'Íslenska' },
    { code: 'ig', name: 'Igbo' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'ga', name: 'Gaeilge' },
    { code: 'it', name: 'Italiano' },
    { code: 'jv', name: 'Basa Jawa' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'kk', name: 'Қазақ' },
    { code: 'km', name: 'ភាសាខ្មែរ' },
    { code: 'rw', name: 'Kinyarwanda' },
    { code: 'ko', name: '한국어' },
    { code: 'ku', name: 'Kurdî' },
    { code: 'ky', name: 'Кыргызча' },
    { code: 'lo', name: 'ລາວ' },
    { code: 'la', name: 'Latina' },
    { code: 'lv', name: 'Latviešu' },
    { code: 'lt', name: 'Lietuvių' },
    { code: 'lb', name: 'Lëtzebuergesch' },
    { code: 'mk', name: 'македонски' },
    { code: 'mg', name: 'Malagasy' },
    { code: 'ms', name: 'Bahasa Melayu' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'mt', name: 'Malti' },
    { code: 'mi', name: 'Te Reo Māori' },
    { code: 'mn', name: 'Монгол' },
    { code: 'my', name: 'မြန်မာ' },
    { code: 'ne', name: 'नेपाली' },
    { code: 'no', name: 'Norsk' },
    { code: 'or', name: 'ଓଡ଼ିଆ' },
    { code: 'ps', name: 'پښتو' },
    { code: 'fa', name: 'فارسی' },
    { code: 'pl', name: 'Polski' },
    { code: 'ro', name: 'Română' },
    { code: 'sm', name: 'Gagana Samoa' },
    { code: 'gd', name: 'Gàidhlig' },
    { code: 'sr', name: 'Срски' },
    { code: 'st', name: 'Sesotho' },
    { code: 'sn', name: 'Shona' },
    { code: 'sd', name: 'سنڌي' },
    { code: 'si', name: 'සිංහල' },
    { code: 'sk', name: 'Slovenčina' },
    { code: 'sl', name: 'Slovenščina' },
    { code: 'so', name: 'Soomaali' },
    { code: 'su', name: 'Basa Sunda' },
    { code: 'sw', name: 'Kiswahili' },
    { code: 'sv', name: 'Svenska' },
    { code: 'tg', name: 'Тоҷикӣ' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'tt', name: 'Татар' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'th', name: 'ไทย' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'tk', name: 'Türkmen' },
    { code: 'uk', name: 'Українська' },
    { code: 'ug', name: 'ئۇيغۇر' },
    { code: 'uz', name: 'O‘zbek' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'cy', name: 'Cymraeg' },
    { code: 'xh', name: 'isiXhosa' },
    { code: 'yi', name: 'ייִדיש' },
    { code: 'yo', name: 'Yorùbá' },
    { code: 'zu', name: 'isiZulu' }
];

export const RESOURCES: Resource[] = [
    { id: 1, type: 'Article', title: 'Understanding Your Triggers', description: 'Learn to identify the people, places, and feelings that lead to cravings.', link: '#'},
    { id: 2, type: 'Exercise', title: '5-Minute Mindfulness Meditation', description: 'A simple exercise to ground yourself when you feel overwhelmed or anxious.', link: '#'},
    { id: 3, type: 'Guide', title: 'Building a Support Network', description: 'Steps to find and cultivate healthy relationships that support your recovery.', link: '#'},
    { id: 4, type: 'Article', title: 'The Science of Addiction', description: 'Understand how addiction affects your brain and why recovery is a journey.', link: '#'},
    { id: 5, type: 'Exercise', title: 'The Gratitude Journal', description: 'A daily practice to shift your focus towards positivity and what you\'re thankful for.', link: '#'},
    { id: 6, type: 'Guide', title: 'Navigating Relapse', description: 'A compassionate guide to help you get back on track if you face a setback.', link: '#'},
];

export const PERSONAS: Persona[] = [
    {
        id: 'therapist',
        name: 'Supportive Therapist',
        description: 'A compassionate and guiding presence, focused on evidence-based techniques.',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>',
        systemInstruction: 'You are empathetic and use techniques from CBT and motivational interviewing. Your tone is calm, professional, and reassuring.'
    },
    {
        id: 'peer',
        name: 'Peer Supporter',
        description: 'Someone who has been there and can relate to your struggles.',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>',
        systemInstruction: 'You are like a friend who has gone through recovery. Your tone is informal, encouraging, and full of shared experiences. Use "we" and "I understand" often.'
    },
    {
        id: 'coach',
        name: 'Mindfulness Coach',
        description: 'A guide to help you stay present and grounded in the moment.',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>',
        systemInstruction: 'You are a mindfulness coach. You guide the user toward awareness of the present moment. You often suggest breathing exercises and grounding techniques.'
    },
    {
        id: 'wellness_coach',
        name: 'SMART Goal & Wellness Coach',
        description: 'An expert to help you set goals and create health plans.',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h.01M12 12h.01M15 16h.01M12 16h.01M9 12h.01M9 16h.01" /></svg>',
        systemInstruction: 'You are an expert wellness coach specializing in SMART goal setting and creating personalized diet and health plans. 1. SMART Goals: If a user gives you a goal, guide them to make it Specific, Measurable, Achievable, Relevant, and Time-bound by asking clarifying questions. 2. Wellness Plans: If a user asks for health advice or a diet plan, use their provided age from the context to create a personalized, actionable plan. If their age is not provided, you MUST ask for it before providing any plan. 3. Tone: Your tone is encouraging, knowledgeable, and supportive. Break down complex information into simple steps and use markdown lists for plans. 4. Disclaimer: Always include a brief disclaimer that you are an AI and your advice is not a substitute for professional medical consultation.'
    }
];

export const GROUP_SESSION_TOPICS: GroupSessionTopic[] = [
    { key: 'gratitude', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>' },
    { key: 'celebrating_wins', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M12 3v18" transform="rotate(15 12 12)" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 21h6a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>' },
    { key: 'navigating_cravings', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17l-2 2c-2.434 2.434-6.377 2.434-8.811 0s-2.434-6.377 0-8.811L10 1" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7l2-2c2.434-2.434 6.377-2.434 8.811 0s2.434 6.377 0 8.811L14 23" /></svg>' },
    { key: 'managing_stress', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14c4-3 4-3 8-6" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 20c4-3 4-3 8-6" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 8c4-3 4-3 8-6" /></svg>' },
];

export const ROLE_PLAY_PERSONAS: RolePlayPersona[] = [
    { id: 'pushy_friend', name: 'A Pushy Friend', description: 'They don\'t really understand your journey and might pressure you.', systemPrompt: 'You are a friend who is a bit of a party animal. You don\'t understand sobriety and see it as a bit boring. You will gently but persistently try to convince the user to have a drink, downplaying the seriousness of their recovery. Your tone is friendly but a little clueless and persuasive.', icon: '🥳' },
    { id: 'curious_family', name: 'Curious Family Member', description: 'They care about you but might ask some awkward questions.', systemPrompt: 'You are a caring but somewhat naive family member. You are supportive of the user\'s recovery but don\'t know much about it. You will ask well-intentioned but potentially awkward or personal questions about their journey, their meetings, and how they feel. Your tone is loving and curious.', icon: '🤔' },
    { id: 'supportive_partner', name: 'Supportive Partner', description: 'Someone who wants to understand and help.', systemPrompt: 'You are the user\'s supportive partner. You are deeply committed to their recovery and want to understand how you can best support them. Ask open, gentle questions about their needs and feelings. Your goal is to listen and offer help, not to solve their problems for them. Your tone is loving, patient, and calm.', icon: '💖' },
    { id: 'worried_friend', name: 'A Worried Friend', description: 'A well-meaning friend who is concerned about your anxiety but might not know what to say.', systemPrompt: 'You are a caring friend who has noticed the user seems anxious or withdrawn lately. You are trying to check in on them. Your tone is concerned and a little worried yourself. You might offer some simple, perhaps slightly naive, advice like "just try not to worry so much".', icon: '😟' },
    { id: 'skeptical_relative', name: 'A Skeptical Relative', description: 'A family member who is not very understanding about mental health.', systemPrompt: 'You are a family member who is a bit old-fashioned. You care about the user but are skeptical about concepts like "anxiety" or "depression," seeing them as a lack of willpower. You will offer unsolicited, dismissive advice like "just cheer up" or "everyone gets sad sometimes". Your tone is not mean, but it is invalidating.', icon: '🧐' },
    { id: 'old_acquaintance', name: 'An Old Acquaintance', description: 'Someone from your past who is still actively using drugs.', systemPrompt: 'You are an old acquaintance from the user\'s past when they were using. You\'ve run into them unexpectedly. You are friendly and nostalgic about the "good old days." You will casually offer the user some hard drugs (like cocaine or pills), assuming they are still using. You will be persistent but not aggressive, downplaying the risks and emphasizing having fun.', icon: '😈' },
    { id: 'healthcare_professional', name: 'A Healthcare Professional', description: 'A doctor or therapist you need to open up to.', systemPrompt: 'You are a calm, professional, and empathetic doctor or therapist. Your goal is to understand the user\'s symptoms. You will ask clear, direct, but gentle questions about what they are experiencing, how long it has been happening, and how it impacts their daily life. Your tone is patient and reassuring.', icon: '🩺' }
];

export const CONVERSATION_SCENARIOS: ConversationPracticeScenario[] = [
    {
        id: 'refusing_drink',
        title: 'Refusing a Drink at a Party',
        description: 'Practice saying "no" confidently when offered a drink in a social setting.',
        systemPrompt: 'The user is at a party and wants to practice refusing a drink. Your goal as the character is to offer them a drink.',
        personas: [ROLE_PLAY_PERSONAS[0], ROLE_PLAY_PERSONAS[1]]
    },
    {
        id: 'explaining_recovery',
        title: 'Explaining Your Recovery',
        description: 'Practice talking about your recovery journey to someone who is curious.',
        systemPrompt: 'The user wants to practice explaining their recovery journey to someone. Your goal as the character is to be curious and ask them about it.',
        personas: [ROLE_PLAY_PERSONAS[1], ROLE_PLAY_PERSONAS[2]]
    },
    {
        id: 'setting_boundary',
        title: 'Setting a Boundary',
        description: 'Practice setting a healthy boundary with a friend or family member.',
        systemPrompt: 'The user wants to practice setting a boundary with you (e.g., "I can\'t lend you money," or "I need some space tonight"). Your goal as the character is to test that boundary a little before accepting it.',
        personas: [ROLE_PLAY_PERSONAS[0], ROLE_PLAY_PERSONAS[2]]
    },
    {
        id: 'opening_up_anxiety',
        title: 'Opening Up About Anxiety',
        description: 'Practice talking about what anxiety feels like to a concerned friend or partner.',
        systemPrompt: 'The user wants to practice opening up about their anxiety. Your role as the character is to listen and react with concern, curiosity, or support.',
        personas: [ROLE_PLAY_PERSONAS[3], ROLE_PLAY_PERSONAS[2]]
    },
    {
        id: 'handling_unsolicited_advice',
        title: 'Handling Unsolicited Advice',
        description: 'Practice responding to well-meaning but unhelpful advice about your mental health.',
        systemPrompt: 'The user is trying to talk about their mental health, and your role as the character is to offer simplistic or dismissive advice.',
        personas: [ROLE_PLAY_PERSONAS[4], ROLE_PLAY_PERSONAS[1]]
    },
    {
        id: 'turning_down_hard_drugs',
        title: 'Turning Down Hard Drugs',
        description: 'Practice a high-stakes refusal with an acquaintance from your past.',
        systemPrompt: 'The user has run into an old acquaintance who is offering them hard drugs. Your goal as the character is to be casually persistent in your offer.',
        personas: [ROLE_PLAY_PERSONAS[5]]
    },
    {
        id: 'declining_cannabis',
        title: 'Declining Cannabis Socially',
        description: 'Practice refusing cannabis in a casual social setting where others are partaking.',
        systemPrompt: 'The user is in a social setting where cannabis is being passed around. Your role as the character is to offer it to them, treating it as a normal, harmless social activity.',
        personas: [ROLE_PLAY_PERSONAS[0], ROLE_PLAY_PERSONAS[5]]
    },
    {
        id: 'talking_to_doctor',
        title: 'Talking to a Doctor',
        description: 'Practice clearly describing your mental health symptoms to a healthcare professional.',
        systemPrompt: 'The user is at a doctor\'s appointment and wants to discuss their mental health. Your role as the doctor is to ask clarifying questions to understand their symptoms.',
        personas: [ROLE_PLAY_PERSONAS[6]]
    }
];

const mindfulnessMasteryChallenges: DailyChallenge[] = Array.from({ length: 90 }, (_, i) => {
    const day = i + 1;
    return {
        day,
        title: `Mindful Moment`,
        description: `Day ${day} focuses on integrating mindfulness into your daily routine to manage stress and cravings.`,
        task: `Practice a 5-minute breathing meditation. Focus on the sensation of your breath without judgment. Notice how you feel before and after.`
    };
});

const cbtFoundationsChallenges: DailyChallenge[] = Array.from({ length: 90 }, (_, i) => {
    const day = i + 1;
    return {
        day,
        title: `Thought Reframing`,
        description: `On day ${day}, you'll learn to identify and challenge negative thought patterns using CBT techniques.`,
        task: `Identify one automatic negative thought you had today. Write it down, and then write a more balanced, alternative thought.`
    };
});

const connectionPathwaysChallenges: DailyChallenge[] = Array.from({ length: 90 }, (_, i) => {
    const day = i + 1;
    return {
        day,
        title: `Building Support`,
        description: `Day ${day} is about strengthening your support system and fostering healthy connections.`,
        task: `Reach out to one supportive friend or family member today, just to check in. No agenda needed.`
    };
});

const lifestyleBalanceChallenges: DailyChallenge[] = Array.from({ length: 90 }, (_, i) => {
    const day = i + 1;
    return {
        day,
        title: `Healthy Habit`,
        description: `Today, on day ${day}, you'll focus on building a healthy lifestyle that supports your long-term recovery.`,
        task: `Engage in 15 minutes of light physical activity, like a walk. Notice how your body and mind feel afterwards.`
    };
});

export const PROGRAMS: Program[] = [
    {
        id: 'mindfulness-mastery',
        name: 'Mindfulness Mastery',
        description: 'A 90-day journey to cultivate awareness, manage cravings, and reduce stress through mindfulness practices.',
        successRate: 92,
        features: ['Daily guided meditations', 'Mindful awareness exercises', 'Stress reduction techniques'],
        // FIX: Added missing testimonial property.
        testimonial: {
            id: 1,
            quote: "The mindfulness exercises changed my relationship with my cravings. I feel more in control than ever.",
            author: "J. Doe",
            location: "California, USA"
        },
        dailyChallenges: mindfulnessMasteryChallenges,
    },
    {
        id: 'cbt-foundations',
        name: 'CBT Foundations',
        description: 'Learn to identify, challenge, and reframe negative thought patterns that contribute to addiction.',
        successRate: 90,
        features: ['Cognitive restructuring tools', 'Behavioral activation tasks', 'Core belief exploration'],
        // FIX: Added missing testimonial property.
        testimonial: {
            id: 2,
            quote: "Understanding my thought patterns was the key. This program gave me the tools to break the cycle.",
            author: "A. Smith",
            location: "New York, USA"
        },
        dailyChallenges: cbtFoundationsChallenges,
    },
    {
        id: 'connection-pathways',
        name: 'Connection Pathways',
        description: 'Focus on rebuilding healthy relationships and developing a strong support system for lasting recovery.',
        successRate: 88,
        features: ['Communication skill-building', 'Boundary setting exercises', 'Support network mapping'],
        // FIX: Added missing testimonial property.
        testimonial: {
            id: 3,
            quote: "I learned how to set boundaries and communicate my needs. My relationships have never been healthier.",
            author: "M. Jones",
            location: "London, UK"
        },
        dailyChallenges: connectionPathwaysChallenges,
    },
    {
        id: 'lifestyle-balance',
        name: 'Lifestyle Balance',
        description: 'Develop healthy habits in nutrition, exercise, and sleep to create a holistic foundation for well-being.',
        successRate: 85,
        features: ['Nutrition and meal planning tips', 'Gentle exercise routines', 'Sleep hygiene improvement'],
        // FIX: Added missing testimonial property.
        testimonial: {
            id: 4,
            quote: "Focusing on my physical health had a huge impact on my mental well-being. A truly holistic approach.",
            author: "S. Lee",
            location: "Seoul, South Korea"
        },
        dailyChallenges: lifestyleBalanceChallenges,
    }
];