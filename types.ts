export enum GameState {
  LANDING = 'LANDING',
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  VICTORY = 'VICTORY',
}

export enum PuzzleType {
  LOGIC = 'logic',
  CULTURAL = 'cultural',
  MAZE = 'maze'
}

export interface PuzzleData {
  id: string;
  type: PuzzleType;
  title: string;
  description: string;
  difficulty: number; // 1-10
  
  // The critical mechanism: Players have different info
  playerClues: string[];    // What YOU see
  partnerClues: string[];   // What the PARTNER sees (Hidden from you, AI knows this)
  
  solution: string;         // The answer
  wolframContext: string;   // "Fake" Wolfram data context for flavor
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'partner' | 'system';
  text: string;
  timestamp: number;
}

export interface PartnerProfile {
  name: string;
  country: string;
  language: string;
  avatarColor: string;
}

export interface UnityMetrics {
  collaboration: number;
  empathy: number;
  communication: number;
  timeTaken: number;
}