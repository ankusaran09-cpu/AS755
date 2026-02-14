
import { GoogleGenAI, Type } from "@google/genai";
import { GameResult } from "../types";

export const getAIRecommendation = async (history: GameResult[]) => {
  // Always use the named parameter and retrieve API key from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const historyString = history
    .slice(0, 10)
    .map(h => `Period: ${h.periodId}, Number: ${h.number}, Colors: ${h.colors.join('+')}`)
    .join('\n');

  try {
    // Using gemini-3-pro-preview for more accurate pattern recognition and trend analysis as a complex text task
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
        Analyze this color prediction game history and predict the next likely color (RED, GREEN, or VIOLET) or Number (0-9).
        Explain the trend logic simply like a market analyst.
        
        History:
        ${historyString}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: { type: Type.STRING, description: "The predicted color or number" },
            reasoning: { type: Type.STRING, description: "Short explanation of the trend" },
            confidence: { type: Type.NUMBER, description: "Confidence score 0-100" }
          },
          required: ["prediction", "reasoning", "confidence"]
        }
      }
    });

    // Access text output using the .text property as per guidelines
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
