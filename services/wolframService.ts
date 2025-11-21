import { WOLFRAM_APP_ID } from "../constants";

/**
 * Fetches a short, concise result from Wolfram|Alpha.
 * Used to get real cultural facts or mathematical answers to seed the AI puzzle generation.
 */
export const fetchWolframData = async (query: string): Promise<string | null> => {
  if (!WOLFRAM_APP_ID) {
    console.warn("Wolfram AppID not found. Using simulated data.");
    return null;
  }

  try {
    // Use Vite's proxy to avoid CORS issues
    // The proxy is configured in vite.config.ts to route /api/wolfram to Wolfram Alpha
    const url = `/api/wolfram/v1/result?appid=${WOLFRAM_APP_ID}&i=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Wolfram API Error: ${response.statusText}`);
    }
    
    const text = await response.text();
    
    // If Wolfram returns "No short answer available", treat as null to fallback
    if (text.includes("No short answer available") || text.includes("Wolfram|Alpha did not understand")) {
        return null;
    }
    
    return text;
  } catch (error) {
    console.error("Failed to fetch real Wolfram data:", error);
    return null;
  }
};

/**
 * Fetches country-specific data from Wolfram Alpha
 */
export const fetchCountryData = async (country: string, property: string): Promise<string | null> => {
  const queries: Record<string, string> = {
    'capital': `capital of ${country}`,
    'population': `population of ${country}`,
    'language': `official language of ${country}`,
    'currency': `currency of ${country}`,
    'area': `area of ${country}`,
    'gdp': `GDP of ${country}`,
    'continent': `what continent is ${country} in`,
    'flag_colors': `colors in ${country} flag`
  };
  
  return fetchWolframData(queries[property] || `${country} ${property}`);
};

/**
 * Fetches mathematical/logical data from Wolfram Alpha
 */
export const fetchMathData = async (query: string): Promise<string | null> => {
  return fetchWolframData(query);
};

/**
 * Fetches graph theory data - shortest paths, node counts, etc.
 */
export const fetchGraphData = async (graphType: string, query: string): Promise<string | null> => {
  const graphQueries: Record<string, string> = {
    'petersen': 'Petersen graph number of vertices',
    'complete': `complete graph ${query} vertices`,
    'cycle': `cycle graph ${query} vertices edges`,
    'path_length': `shortest path length in ${graphType} graph`
  };
  
  return fetchWolframData(graphQueries[graphType] || query);
};

/**
 * Get random cultural similarity between two countries
 */
export const fetchCulturalSimilarity = async (country1: string, country2: string): Promise<string | null> => {
  // Try different similarity queries
  const queries = [
    `${country1} and ${country2} common language families`,
    `distance between ${country1} and ${country2}`,
    `${country1} ${country2} similar cuisine`
  ];
  
  // Try first query, fallback to others
  for (const query of queries) {
    const result = await fetchWolframData(query);
    if (result) return result;
  }
  
  return null;
};

/**
 * Generates a simulated Wolfram Context string based on the query,
 * to keep the aesthetic even if the API call fails or is simulated.
 */
export const generateWolframContext = (topic: string, type: string): string => {
  if (type === 'cultural') {
    return `EntityValue[Entity["Country", "${topic}"], "CulturalTraditions"] // RandomSample`;
  } else if (type === 'logic') {
    return `FindSequenceFunction[{2, 3, 5, 7, 11, 13, 17}]`;
  } else {
    return `GraphData["${topic}"] // FindShortestPath`;
  }
};