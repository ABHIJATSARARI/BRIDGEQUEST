import { GoogleGenAI, Type } from "@google/genai";
import { PuzzleData, PuzzleType } from "../types";
import { 
  fetchWolframData, 
  fetchCountryData, 
  fetchMathData,
  fetchGraphData,
  fetchCulturalSimilarity,
  generateWolframContext 
} from "./wolframService";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const PUZZLE_GENERATION_MODEL = "gemini-2.5-flash";

export const generatePuzzle = async (
  level: number, 
  partnerCountry: string,
  playerCountry: string = "USA",
  performanceMetrics?: { errorCount: number; avgCompletionTime: number; chatActivity: number }
): Promise<PuzzleData> => {
  if (!apiKey) {
    return mockPuzzle(level);
  }

  // Calculate adaptive difficulty based on performance
  let adjustedDifficulty = level;
  if (performanceMetrics) {
    // If player is doing well (low errors, fast times, good chat), increase difficulty
    if (performanceMetrics.errorCount < 2 && performanceMetrics.avgCompletionTime < 60000) {
      adjustedDifficulty = Math.min(10, level + 1);
    }
    // If struggling, maintain or reduce difficulty
    else if (performanceMetrics.errorCount > 5) {
      adjustedDifficulty = Math.max(1, level - 1);
    }
  }

  // Enhanced Wolfram data fetching based on level and type
  let realFact = null;
  let wolframQuery = "";
  let puzzleType: PuzzleType = PuzzleType.LOGIC;
  
  try {
    // Level 1: Cultural - Country facts
    if (level === 1) {
      puzzleType = PuzzleType.CULTURAL;
      wolframQuery = `capital of ${partnerCountry}`;
      realFact = await fetchCountryData(partnerCountry, 'capital');
    }
    // Level 2: Graph Theory - Shortest paths
    else if (level === 2) {
      puzzleType = PuzzleType.MAZE;
      wolframQuery = "Petersen graph vertices";
      realFact = await fetchGraphData('petersen', '');
    }
    // Level 3: Cultural Similarity
    else if (level === 3) {
      puzzleType = PuzzleType.CULTURAL;
      wolframQuery = `distance between ${playerCountry} and ${partnerCountry}`;
      realFact = await fetchCulturalSimilarity(playerCountry, partnerCountry);
    }
    // Level 4: Advanced Math
    else {
      puzzleType = PuzzleType.LOGIC;
      wolframQuery = `${level}th Fibonacci number`;
      realFact = await fetchMathData(wolframQuery);
    }
  } catch (e) {
    console.warn("Skipping Wolfram fetch", e);
  }

  const wolframInjection = realFact 
    ? `REAL DATA FROM WOLFRAM ALPHA: "${wolframQuery}" returned "${realFact}". USE THIS FACT AS THE SOLUTION OR KEY CLUE.` 
    : `(Wolfram API unavailable, generate realistic fictional data for ${puzzleType} puzzle)`;

  const typeInstructions: Record<string, string> = {
    cultural: `Create a puzzle about ${partnerCountry} culture/geography. 
    SPECIAL MECHANICS:
    - Include a phrase in ${partnerCountry}'s language that the user must identify or translate
    - Or create a "find common features" task between two countries
    - Examples: capital city, language phrases, traditions, currency, famous landmarks, shared cultural traits`,
    maze: `Create a GRAPH THEORY puzzle with nodes (A, B, C, D, E, F) and edges. Player sees some edges, partner sees other edges. Solution is shortest path or specific node.`,
    logic: `Create a mathematical/logical sequence puzzle. Examples: Fibonacci, primes, pattern recognition, arithmetic sequences.`
  };

  const prompt = `
    Act as the engine for "BridgeQuest", a game powered by Wolfram Language logic.
    Generate a cooperative puzzle for a player paired with a partner from ${partnerCountry}.
    
    Level: ${level} (1-4)
    Adaptive Difficulty: ${adjustedDifficulty} (adjusted based on player performance)
    Puzzle Type: ${puzzleType}
    ${typeInstructions[puzzleType]}
    
    ${wolframInjection}
    
    CRITICAL: The puzzle MUST be cooperative:
    - playerClues: Information ONLY the user can see
    - partnerClues: Information ONLY the partner can see  
    - Neither can solve it alone. They MUST communicate and share clues.
    - The solution should require combining information from BOTH sides.
    
    ${puzzleType === 'maze' ? `
    For MAZE puzzles, use graph notation:
    - Player might see: "Node A connects to: B, C"
    - Partner might see: "Node B connects to: D, E" and "Path weights: AB=3, BC=5"
    - Solution: "B-D" (shortest path) or specific node
    ` : ''}

    Return JSON format matching this schema:
    {
      "id": "string",
      "type": "logic" | "cultural" | "maze",
      "title": "string",
      "description": "Brief flavor text describing the challenge",
      "difficulty": number,
      "playerClues": ["string array of visual/text clues for the user"],
      "partnerClues": ["string array of clues the PARTNER has that the user NEEDS"],
      "solution": "The exact string answer (case insensitive)",
      "wolframContext": "A Wolfram Language code snippet related to this puzzle"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: PUZZLE_GENERATION_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["logic", "cultural", "maze"] },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.NUMBER },
            playerClues: { type: Type.ARRAY, items: { type: Type.STRING } },
            partnerClues: { type: Type.ARRAY, items: { type: Type.STRING } },
            solution: { type: Type.STRING },
            wolframContext: { type: Type.STRING },
          },
          required: ["id", "type", "title", "description", "playerClues", "partnerClues", "solution"],
        }
      }
    });

    const puzzle = JSON.parse(response.text || "{}");
    
    // Enhance the context if we have real data
    if (realFact) {
        puzzle.wolframContext = `WolframAlpha["${wolframQuery}"] -> "${realFact}"\n` + puzzle.wolframContext;
    }

    return puzzle;
  } catch (error) {
    console.error("Gemini generation failed, using mock", error);
    return mockPuzzle(level);
  }
};

export const getPartnerChatResponse = async (
  chatHistory: {role: string, text: string}[], 
  puzzle: PuzzleData,
  partnerName: string,
  partnerCountry: string
): Promise<string> => {
  if (!apiKey) return `(Mock) ${partnerName}: I think we need to combine my clue about ${puzzle.partnerClues[0]} with yours.`;

  // Add personality based on country and puzzle type
  const personalities: Record<string, string> = {
    'Japan': 'polite, thoughtful, precise',
    'Spain': 'warm, expressive, helpful',
    'India': 'enthusiastic, collaborative, insightful',
    'Canada': 'friendly, patient, encouraging',
    'Norway': 'direct, logical, supportive'
  };

  const personality = personalities[partnerCountry] || 'friendly, helpful';

  const prompt = `
    You are roleplaying as ${partnerName} from ${partnerCountry}.
    Your personality: ${personality}
    
    You are playing BridgeQuest with a partner (the user).
    
    Current Puzzle: ${puzzle.title} (Type: ${puzzle.type})
    Your Hidden Clues (Only you see these): ${JSON.stringify(puzzle.partnerClues)}
    The Solution: ${puzzle.solution}
    
    IMPORTANT STRATEGY:
    - If they ask about your clues: Share 1-2 clues naturally, not all at once
    - If they share their clues: Acknowledge and try to connect with yours
    - Guide them toward the solution by asking questions too
    - Be encouraging and collaborative
    - Keep responses under 40 words
    
    Chat History:
    ${chatHistory.slice(-6).map(m => `${m.role}: ${m.text}`).join('\n')}
    
    Respond as ${partnerName}:
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "...";
  } catch (e) {
    return "Connection unstable...";
  }
};

// Fallback mock data with variety
const mockPuzzle = (level: number): PuzzleData => {
  const mockPuzzles: PuzzleData[] = [
    {
      id: `mock-1-${Date.now()}`,
      type: PuzzleType.CULTURAL,
      title: "Language Bridge Protocol",
      description: "A phrase in your partner's language holds the key. Work together to decode it.",
      difficulty: 1,
      playerClues: [
        "You see a phrase: 'こんにちは'",
        "It uses Japanese characters",
        "Your partner knows what it means"
      ],
      partnerClues: [
        "The phrase means: 'Hello'",
        "It's a common greeting",
        "Pronunciation: Konnichiwa"
      ],
      solution: "Hello",
      wolframContext: "Entity[\"Language\", \"Japanese\"]; Interpreter[\"CommonWords\"]"
    },
    {
      id: `mock-2-${Date.now()}`,
      type: PuzzleType.MAZE,
      title: "Graph Navigation Challenge",
      description: "A network of nodes requires path analysis. Find the shortest route.",
      difficulty: 2,
      playerClues: [
        "Node connections: A→B, A→C, B→D",
        "You need to reach node E",
        "Some paths have weights (costs)"
      ],
      partnerClues: [
        "Path weights: C→E (cost: 2), D→E (cost: 5)",
        "Node B→D has cost: 1",
        "Direct path A→E blocked"
      ],
      solution: "A-C-E",
      wolframContext: "GraphData[\"PetersenGraph\"]; FindShortestPath[g, \"A\", \"E\"]"
    },
    {
      id: `mock-3-${Date.now()}`,
      type: PuzzleType.CULTURAL,
      title: "Unity Matrix: Find Common Ground",
      description: "Two nations, seemingly different, share surprising similarities. Discover what connects them.",
      difficulty: 3,
      playerClues: [
        "Nation A: Archipelago in East Asia",
        "Nation A: Known for technology and tradition",
        "Nation A: Has an emperor"
      ],
      partnerClues: [
        "Nation B: Island nation in Europe",
        "Nation B: Has a constitutional monarchy",
        "Both nations: Are island nations with monarchies"
      ],
      solution: "island monarchy",
      wolframContext: "Intersection[EntityValue[Entity[\"Country\", \"Japan\"], \"Features\"], EntityValue[Entity[\"Country\", \"UnitedKingdom\"], \"Features\"]]"
    },
    {
      id: `mock-4-${Date.now()}`,
      type: PuzzleType.LOGIC,
      title: "Fibonacci Convergence",
      description: "Two sequences spiral toward unity. Calculate their intersection.",
      difficulty: 4,
      playerClues: [
        "Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13...",
        "The 10th number is 55",
        "Looking for the 12th number"
      ],
      partnerClues: [
        "The 11th Fibonacci number is 89",
        "Formula: F(n) = F(n-1) + F(n-2)",
        "F(12) = F(11) + F(10)"
      ],
      solution: "144",
      wolframContext: "Fibonacci[12]; Table[Fibonacci[n], {n, 1, 15}]"
    }
  ];

  return mockPuzzles[Math.min(level - 1, mockPuzzles.length - 1)];
};