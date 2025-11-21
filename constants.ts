import { LucideIcon, Brain, Globe, Puzzle, Zap, Heart, Shield } from 'lucide-react';

// REPLACEME: Paste your Wolfram AppID here to enable real data fetching
export const WOLFRAM_APP_ID = ''; 

export const MOCK_PARTNERS = [
  { name: "Aravind", country: "India", language: "Tamil", avatarColor: "bg-orange-500" },
  { name: "Elena", country: "Spain", language: "Spanish", avatarColor: "bg-red-500" },
  { name: "Kenji", country: "Japan", language: "Japanese", avatarColor: "bg-rose-500" },
  { name: "Sarah", country: "Canada", language: "French", avatarColor: "bg-blue-500" },
  { name: "Lars", country: "Norway", language: "Norwegian", avatarColor: "bg-cyan-600" },
];

// Cultural phrases for language exchange puzzles
export const CULTURAL_PHRASES: Record<string, { phrase: string; meaning: string; pronunciation: string }[]> = {
  "Japan": [
    { phrase: "ありがとう", meaning: "Thank you", pronunciation: "Arigatou" },
    { phrase: "こんにちは", meaning: "Hello", pronunciation: "Konnichiwa" },
    { phrase: "おはよう", meaning: "Good morning", pronunciation: "Ohayou" }
  ],
  "Spain": [
    { phrase: "Gracias", meaning: "Thank you", pronunciation: "Grah-see-ahs" },
    { phrase: "Hola", meaning: "Hello", pronunciation: "Oh-lah" },
    { phrase: "Buenos días", meaning: "Good morning", pronunciation: "Bway-nohs dee-ahs" }
  ],
  "India": [
    { phrase: "நன்றி", meaning: "Thank you", pronunciation: "Nandri" },
    { phrase: "வணக்கம்", meaning: "Hello", pronunciation: "Vanakkam" },
    { phrase: "காலை வணக்கம்", meaning: "Good morning", pronunciation: "Kaalai Vanakkam" }
  ],
  "Canada": [
    { phrase: "Merci", meaning: "Thank you", pronunciation: "Mare-see" },
    { phrase: "Bonjour", meaning: "Hello", pronunciation: "Bon-zhoor" },
    { phrase: "Bonne journée", meaning: "Have a good day", pronunciation: "Bon zhoor-nay" }
  ],
  "Norway": [
    { phrase: "Takk", meaning: "Thank you", pronunciation: "Tahk" },
    { phrase: "Hei", meaning: "Hello", pronunciation: "Hay" },
    { phrase: "God morgen", meaning: "Good morning", pronunciation: "Goo mor-gen" }
  ]
};

// Common features for finding similarities
export const COUNTRY_SIMILARITIES: Record<string, string[]> = {
  "Japan": ["island nation", "monarchy", "advanced technology", "tea culture", "rice-based cuisine"],
  "Spain": ["Mediterranean", "monarchy", "colonial history", "romance language", "wine culture"],
  "India": ["democracy", "diverse languages", "ancient civilization", "spice trade", "cricket"],
  "Canada": ["commonwealth", "bilingual", "natural resources", "hockey", "vast territory"],
  "Norway": ["monarchy", "fjords", "Viking heritage", "oil rich", "winter sports"]
};

export const LEVEL_THEMES = [
  { name: "Forest of Miscommunication", color: "text-emerald-400", icon: Globe },
  { name: "Bridge of Differences", color: "text-indigo-400", icon: Puzzle },
  { name: "Cave of Empathy", color: "text-purple-400", icon: Heart },
  { name: "Mountain of Unity", color: "text-amber-400", icon: Shield },
];

export const INITIAL_PUZZLE_CONTEXT = `
  Wolfram Language Context:
  Entity["Concept", "Unity"]
  GraphData["PetersenGraph"]
  BridgeQuest["DifficultyMatrix", {Level -> 1}]
`;