import { GoogleGenAI, Type } from "@google/genai";
import { LifeGuidanceResponse, GuidanceIntent } from "../types";

const LIFE_GUIDANCE_SYSTEM_PROMPT = `You are Noor, a real-time Islamic Life Guidance AI. Your purpose is to provide immediate, authentic, and contextual Islamic guidance for daily situations.

RULES:
1. STRUCTURE: Every response must be strictly JSON with fields: guidance, explanation, evidence {text, reference}, actionSteps [], avoid [], recommendedDua {arabic, translation}, isUrgent.
2. SOURCE: Use ONLY Quran and Sahih Hadith. Never fabricate.
3. SAFETY: No fatwas. No judging. If a personal ruling is needed, state: "For personal rulings, please consult a qualified scholar."
4. TONE: Calm, respectful, and supportive.
5. RAW JSON ONLY: Do not wrap the JSON in markdown code blocks. Do not include any text outside the JSON object.

CONTEXT AWARENESS:
- Detect emotions: Anger, Guilt, Stress, Confusion.
- Intent Categories: emotional_distress, moral_decision, relationship_issue, worship_question, temptation, confusion, repentance, motivation, life_decision.`;

export const getSituationalGuidance = async (message: string, previousContext: string[] = []): Promise<LifeGuidanceResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const hour = new Date().getHours();
  const isFriday = new Date().getDay() === 5;
  const timeContext = `Current time: ${hour}:00. ${isFriday ? "It is Friday." : ""}`;
  
  const prompt = `User Situation: "${message}". ${timeContext}. History: ${previousContext.join(" | ")}. Provide structured guidance.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: LIFE_GUIDANCE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            guidance: { type: Type.STRING, description: "Direct spiritual advice" },
            explanation: { type: Type.STRING, description: "Detailed contextual explanation" },
            evidence: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Ayah or Hadith text" },
                reference: { type: Type.STRING, description: "Surah/Verse or Collection number" }
              },
              required: ["text", "reference"]
            },
            actionSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3 immediate actions" },
            avoid: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of things to avoid" },
            recommendedDua: {
              type: Type.OBJECT,
              properties: {
                arabic: { type: Type.STRING, description: "Dua in Arabic" },
                translation: { type: Type.STRING, description: "English translation" }
              },
              required: ["arabic", "translation"]
            },
            isUrgent: { type: Type.BOOLEAN, description: "True if the user is in severe distress" }
          },
          required: ["guidance", "explanation", "evidence", "actionSteps", "avoid", "recommendedDua", "isUrgent"]
        }
      }
    });

    const text = response.text?.trim() || "";
    if (!text) throw new Error("Empty AI response");

    // Remove markdown code block markers if present (sometimes models ignore the config)
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Guidance Engine Error:", e);
    // Return a rich fallback instead of throwing to prevent infinite loading in the UI
    return {
      guidance: "Trust in Allah's plan and seek clarity through prayer.",
      explanation: "I am experiencing difficulty connecting to the archives of wisdom, but the fundamental principle remains: 'With hardship, there is ease.'",
      evidence: { 
        text: "Verily, with every hardship there is relief.", 
        reference: "Quran 94:6" 
      },
      actionSteps: [
        "Perform a fresh Wudu (Ablution)",
        "Offer two Rakats of Nafl prayer with focus",
        "Say 'Hasbunallahu wa ni'mal wakeel' (Allah is sufficient for us)"
      ],
      avoid: [
        "Overthinking the past",
        "Despairing of Allah's mercy"
      ],
      recommendedDua: { 
        arabic: "اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ", 
        translation: "O Allah, I hope for Your mercy. Do not leave me to myself even for the blinking of an eye." 
      },
      isUrgent: false
    };
  }
};

export const classifyIntent = (message: string): GuidanceIntent => {
  const msg = message.toLowerCase();
  if (msg.includes('guilt') || msg.includes('sinned') || msg.includes('forgive')) return 'repentance';
  if (msg.includes('angry') || msg.includes('anger') || msg.includes('argued')) return 'emotional_distress';
  if (msg.includes('lost') || msg.includes('handle') || msg.includes('give up')) return 'emotional_distress';
  if (msg.includes('should i') || msg.includes('decision')) return 'life_decision';
  if (msg.includes('haram') || msg.includes('halal') || msg.includes('wrong')) return 'moral_decision';
  return 'general';
};