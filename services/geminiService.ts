
import { GoogleGenAI, GenerateContentResponse, Chat, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { 
  HifdhSettings, 
  UserProfile, 
  RecoveryContext, 
  DebtEmotion,
  DreamReflectionResult,
  KhutbahResult,
  JournalAnalysis,
  SadaqahReflection,
  RecoveryPlan,
  DebtGuidance,
  MoodSupportResult,
  DuaItem,
  TaraweehInsight
} from "../types";

// Initialize AI Instance once
const getAIInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Start a new chat session with Noor
export const startNewChat = (instruction = SYSTEM_PROMPT) => {
  const ai = getAIInstance();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: instruction,
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      tools: [{ googleSearch: {} }]
    },
  });
};

// Generate Taraweeh Insight
export const generateTaraweehInsight = async (juzOrSurah: string): Promise<TaraweehInsight> => {
  const ai = getAIInstance();
  const prompt = `Provide a scholarly summary for Taraweeh recitation of: ${juzOrSurah}.
  Include:
  1. A brief spiritual summary of the content.
  2. 3 Key Themes covered.
  3. 3 Practical Action Points for the believer to apply tomorrow.
  
  Strict JSON output. No Markdown.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          juz: { type: Type.NUMBER }, // Optional placeholder
          summary: { type: Type.STRING },
          keyThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
          actionPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "keyThemes", "actionPoints"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

/**
 * Advanced Dua Research tool using Search Grounding.
 * Finds authentic duas for specific user needs via Google Search.
 */
export const findDuaResearch = async (query: string): Promise<DuaItem | null> => {
  const ai = getAIInstance();
  const prompt = `Search for an authentic Islamic Dua (supplication) from the Quran or Sahih Hadith for: "${query}".
  Include the following details in a clean JSON format:
  1. title (brief title)
  2. whenToSay (appropriate context)
  3. arabic (full Arabic text)
  4. transliteration (English transliteration)
  5. translation (English meaning)
  6. reference (Exact collection/surah:verse)
  7. authenticity (Sahih, Hasan, or Quran)
  8. category (The most fitting from: ${query})
  9. meaningSummary (Short spiritual benefit)
  
  STRICT RULE: ONLY RETURN AUTHENTIC SOURCES. If the source is not Sahih/Hasan, do not return it.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            whenToSay: { type: Type.STRING },
            arabic: { type: Type.STRING },
            transliteration: { type: Type.STRING },
            translation: { type: Type.STRING },
            reference: { type: Type.STRING },
            authenticity: { type: Type.STRING },
            category: { type: Type.STRING },
            meaningSummary: { type: Type.STRING }
          },
          required: ["title", "arabic", "translation", "reference", "authenticity"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      ...data,
      id: `ai-search-${Date.now()}`,
      tags: [query, data.category],
      usageFrequency: 0
    };
  } catch (e) {
    console.error("Dua Research Error:", e);
    return null;
  }
};

// Advanced complex spiritual reasoning with Thinking Mode
export const complexSpiritualReasoning = async (query: string) => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: query,
    config: {
      systemInstruction: "You are the Noor High-Reasoning Engine. You provide multi-layered scholarly analysis on complex spiritual and life challenges using authentic Islamic principles.",
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
  return response.text || "";
};

// Up-to-date religious information with Search Grounding
export const searchGroundedInfo = async (query: string) => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      systemInstruction: "You are Noor, specialized in retrieving current Islamic information using search grounding.",
      tools: [{ googleSearch: {} }],
    },
  });
  
  const text = response.text || "";
  const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  return { text, grounding };
};

// Send a message via stream
export const sendMessageToGemini = async (chat: Chat, message: string) => {
  return chat.sendMessageStream({ message });
};

// Generate simple response from Noor
export const generateNoorResponse = async (prompt: string, systemInstruction: string = SYSTEM_PROMPT) => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
    }
  });
  return response.text || "";
};

// Generate mood-based guidance
export const generateMoodSupport = async (emotion: string): Promise<MoodSupportResult> => {
  const ai = getAIInstance();
  const prompt = `User is feeling: ${emotion}. 
  Provide spiritual support based on authentic Islamic texts.
  Return a JSON object with:
  1. emotion (the input)
  2. verses (array of {arabic, translation, transliteration, reference})
  3. duas (array of {title, arabic, translation, transliteration, reference})
  4. azkar (array of {text, virtue, count})
  5. advice (compassionate spiritual counsel, plain text, no markdown).
  
  STRICT RULE: PLAIN TEXT ONLY within fields. NO MARKDOWN. Include references from Sahih sources.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          emotion: { type: Type.STRING },
          verses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                arabic: { type: Type.STRING },
                translation: { type: Type.STRING },
                transliteration: { type: Type.STRING },
                reference: { type: Type.STRING }
              }
            }
          },
          duas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                arabic: { type: Type.STRING },
                translation: { type: Type.STRING },
                transliteration: { type: Type.STRING },
                reference: { type: Type.STRING }
              }
            }
          },
          azkar: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                virtue: { type: Type.STRING },
                count: { type: Type.NUMBER }
              }
            }
          },
          advice: { type: Type.STRING }
        },
        required: ["emotion", "verses", "duas", "azkar", "advice"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

// Generate insight for Sunnah practices
export const generateSunnahInsight = async (topic: string) => {
  const ai = getAIInstance();
  const prompt = `Generate a high-depth Prophetic Sunnah insight for the topic: ${topic}.
  
  SCHOLARLY REQUIREMENTS (SUNNAH.COM INTEGRATION):
  1. Follow the classification standards of Sunnah.com.
  2. PROVIDE A PROPHETIC NARRATIVE: Detailed application from the Seerah ﷺ.
  3. SCHOLARLY EXPLANATION: Benefits mentioned by classical Muhaddithin (Hadith scholars).
  4. VERIFICATION: You must provide the exact collection name (e.g., Sahih Bukhari, Sunan Abi Dawud) and Hadith number that would match Sunnah.com database.
  
  Return as a JSON object with: title, description, prophetic_application, scholarly_explanation, how_to_practice (3 steps), reward, hadith_reference, authenticity (Sahih/Hasan), category.
  
  STRICT RULE: PLAIN TEXT ONLY within fields. NO MARKDOWN.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          prophetic_application: { type: Type.STRING },
          scholarly_explanation: { type: Type.STRING },
          how_to_practice: { type: Type.ARRAY, items: { type: Type.STRING } },
          reward: { type: Type.STRING },
          hadith_reference: { type: Type.STRING },
          authenticity: { type: Type.STRING },
          category: { type: Type.STRING }
        },
        required: ["title", "description", "prophetic_application", "scholarly_explanation", "how_to_practice", "reward", "hadith_reference", "authenticity", "category"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return null;
  }
};

// Verify a tradition via scholarly check
export const verifyTraditionScholarly = async (text: string) => {
  const ai = getAIInstance();
  const prompt = `Review the following religious tradition or advice: "${text}". 
  Determine its authenticity based on the Sunnah.com core collections.
  Provide: 
  1. Verification Status (Verified/Discussion/Unsupported).
  2. Exact Hadith Source and Number.
  3. Context of the narrator.
  
  STRICT RULE: PLAIN TEXT ONLY. NO MARKDOWN.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: "You are the Noor Scholarly Verification Engine. You specialize in Hadith sciences and cross-referencing Sunnah.com archives.",
    }
  });
  return response.text || "";
};

// Generate ethical scenario for practice
export const generateEthicalScenario = async () => {
  const ai = getAIInstance();
  const prompt = "Generate a short ethical dilemma that a modern Muslim might face at work or in social life. The scenario should be realistic and complex, requiring judgment based on Islamic principles of Maslaha or Maqasid al-Shariah. PLAIN TEXT ONLY. NO MARKDOWN.";
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: "You are Noor, an ethical guide for modern seekers." }
  });
  return response.text || "";
};

// Evaluate an ethical dilemma response
export const evaluateEthicalDilemma = async (dilemma: string) => {
  const ai = getAIInstance();
  const prompt = `Analyze this dilemma from an Islamic ethical perspective: "${dilemma}". Focus on which of the 5 Maqasid (Faith, Life, Intellect, Lineage, Property) are affected. Provide a balanced analysis. PLAIN TEXT ONLY. NO MARKDOWN.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: "You are Noor, an ethical guide specializing in Maqasid al-Shariah." }
  });
  return response.text || "";
};

// Provide Prophetic solution to a personal challenge
export const getPropheticSolution = async (problem: string) => {
  const ai = getAIInstance();
  const prompt = `User challenge: "${problem}". Provide a compassionate solution derived from the Seerah and Sunnah. Focus on how the Prophet ﷺ handled similar emotional or social difficulties. PLAIN TEXT ONLY. NO MARKDOWN.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: "You are Noor, a spiritual companion providing Prophetic guidance." }
  });
  return response.text || "";
};

// Reflect on a dream description
export const generateDreamReflection = async (text: string, context: any, image?: string): Promise<DreamReflectionResult> => {
  const ai = getAIInstance();
  const prompt = `Dream: "${text}". Context: ${JSON.stringify(context)}. Provide a traditional Islamic dream reflection based on classical principles (Ibn Sirin style) while remaining spiritually cautiously and encouraging. Return JSON.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          meanings: { type: Type.STRING },
          spiritualAdvice: { type: Type.STRING }
        },
        required: ["type", "meanings", "spiritualAdvice"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

// Generate a full Friday Khutbah
export const generateKhutbah = async (params: { topic: string; audience: string; duration: string; tone: string; region: string }): Promise<KhutbahResult> => {
  const ai = getAIInstance();
  const prompt = `Generate a high-fidelity Friday Khutbah on: ${params.topic}. For audience: ${params.audience}. Duration: ${params.duration}. Context: ${params.region}. Return JSON. PLAIN TEXT ONLY in fields.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metadata: { type: Type.OBJECT, properties: { topic: { type: Type.STRING }, audience: { type: Type.STRING }, duration: { type: Type.STRING }, tone: { type: Type.STRING }, region: { type: Type.STRING } }, required: ["topic", "audience", "duration", "tone", "region"] },
          part1: { type: Type.OBJECT, properties: { khutbatulHaajahArabic: { type: Type.STRING }, khutbatulHaajahTranslation: { type: Type.STRING }, intro: { type: Type.STRING }, quranAyat: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { arabic: { type: Type.STRING }, translation: { type: Type.STRING }, reference: { type: Type.STRING } } } }, hadiths: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { arabic: { type: Type.STRING }, translation: { type: Type.STRING }, reference: { type: Type.STRING } } } }, explanation: { type: Type.STRING }, application: { type: Type.STRING }, transition: { type: Type.STRING }, presenterNote: { type: Type.STRING } }, required: ["khutbatulHaajahArabic", "khutbatulHaajahTranslation", "intro", "quranAyat", "hadiths", "explanation", "application", "transition"] },
          part2: { type: Type.OBJECT, properties: { recap: { type: Type.STRING }, callToAction: { type: Type.STRING }, practicalSteps: { type: Type.ARRAY, items: { type: Type.STRING } }, closingDuaArabic: { type: Type.STRING }, closingSalawat: { type: Type.STRING }, presenterNote: { type: Type.STRING } }, required: ["recap", "callToAction", "practicalSteps", "closingDuaArabic", "closingSalawat"] },
          congregationalDuas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { context: { type: Type.STRING }, arabic: { type: Type.STRING }, transliteration: { type: Type.STRING }, translation: { type: Type.STRING } } } }
        },
        required: ["metadata", "part1", "part2", "congregationalDuas"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

// Analyze a journal entry for spiritual insights
export const generateJournalAnalysis = async (text: string): Promise<JournalAnalysis> => {
  const ai = getAIInstance();
  const prompt = `Analyze this spiritual journal entry: "${text}". Provide deep insight, identify themes, and suggest a spiritual action. Return JSON. PLAIN TEXT ONLY.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          insight: { type: Type.STRING },
          themes: { type: Type.ARRAY, items: { type: Type.STRING } },
          spiritualAction: { type: Type.STRING }
        },
        required: ["insight", "themes", "spiritualAction"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

// Generate a Hifdh (Quran memorization) plan
export const generateHifdhPlan = async (settings: HifdhSettings): Promise<{ tasks: any[] }> => {
  const ai = getAIInstance();
  const prompt = `Create a 3-day Hifdh task sample for: ${JSON.stringify(settings)}. IncludeSurah names and Ayah ranges. Return JSON.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                surahName: { type: Type.STRING },
                startAyah: { type: Type.NUMBER },
                endAyah: { type: Type.NUMBER },
                strength: { type: Type.STRING },
                nextReviewDate: { type: Type.STRING }
              },
              required: ["id", "type", "surahName", "startAyah", "endAyah", "strength", "nextReviewDate"]
            }
          }
        },
        required: ["tasks"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

// Get response from Hifdh Coach AI
export const getHifdhCoachResponse = async (query: string) => {
  const ai = getAIInstance();
  const prompt = `Hifdh Question: "${query}". Provide a practical, encouraging strategy for Quran memorization or retention. PLAIN TEXT ONLY. NO MARKDOWN.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: "You are the Hifdh Coach AI, an expert in Quranic memorization methods." }
  });
  return response.text || "";
};

// Provide AI-powered tips for integrating a Sunnah into daily life
export const getSunnahIntegrationTips = async (sunnahTitle: string) => {
  const ai = getAIInstance();
  const prompt = `I want to integrate the Sunnah of "${sunnahTitle}" into my daily routine. As the Hifdh Coach AI, provide 3 practical, habit-forming strategies to make this consistent. Focus on small steps and spiritual psychological tricks. PLAIN TEXT ONLY. NO MARKDOWN.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: "You are the Hifdh Coach AI, an expert in building spiritual habits and discipline." }
  });
  return response.text || "";
};

// Generate a Deen Journey roadmap
export const generateDeenJourneyPlan = async (profile: UserProfile): Promise<{ phases: any[] }> => {
  const ai = getAIInstance();
  const prompt = `Create a 90-day Deen Journey plan for this profile: ${JSON.stringify(profile)}. Return 3 phases, each with 4 weeks. Return JSON.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          phases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phaseNumber: { type: Type.NUMBER },
                name: { type: Type.STRING },
                weeks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      weekNumber: { type: Type.NUMBER },
                      theme: { type: Type.STRING },
                      focus: { type: Type.STRING },
                      recommendedAyah: { type: Type.OBJECT, properties: { arabic: { type: Type.STRING }, translation: { type: Type.STRING }, reference: { type: Type.STRING } } },
                      actions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, text: { type: Type.STRING }, category: { type: Type.STRING }, completed: { type: Type.BOOLEAN } } } },
                      reflectionPrompt: { type: Type.STRING }
                    },
                    required: ["weekNumber", "theme", "focus", "recommendedAyah", "actions", "reflectionPrompt"]
                  }
                }
              },
              required: ["phaseNumber", "name", "weeks"]
            }
          }
        },
        required: ["phases"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

// Reflect on a Sadaqah act
export const generateSadaqahReflection = async (category: string, description: string): Promise<SadaqahReflection> => {
  const ai = getAIInstance();
  const prompt = `Act: ${description} (Category: ${category}). Provide a Quranic Ayah of barakah, a reminder on sincerity, and a short dua. Return JSON. PLAIN TEXT ONLY.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ayah: { type: Type.OBJECT, properties: { arabic: { type: Type.STRING }, translation: { type: Type.STRING }, reference: { type: Type.STRING } }, required: ["arabic", "translation", "reference"] },
          sincerityReminder: { type: Type.STRING },
          dua: { type: Type.OBJECT, properties: { arabic: { type: Type.STRING }, transliteration: { type: Type.STRING }, translation: { type: Type.STRING } }, required: ["arabic", "transliteration", "translation"] }
        },
        required: ["ayah", "sincerityReminder", "dua"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

// Provide recovery guidance after a spiritual slip
export const generateRecoveryGuidance = async (context: RecoveryContext): Promise<RecoveryPlan> => {
  const ai = getAIInstance();
  const prompt = `Spiritual slip context: ${JSON.stringify(context)}. Provide a mercy-focused reset plan. Return JSON. PLAIN TEXT ONLY.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mercyAyah: { type: Type.OBJECT, properties: { arabic: { type: Type.STRING }, translation: { type: Type.STRING }, reference: { type: Type.STRING } }, required: ["arabic", "translation", "reference"] },
          reflection: { type: Type.STRING },
          checklist: { type: Type.ARRAY, items: { type: Type.STRING } },
          resetPlan: { type: Type.OBJECT, properties: { morning: { type: Type.STRING }, evening: { type: Type.STRING }, mindset: { type: Type.STRING } }, required: ["morning", "evening", "mindset"] }
        },
        required: ["mercyAyah", "reflection", "checklist", "resetPlan"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

// Provide guidance for debt relief
export const generateDebtGuidance = async (emotion: DebtEmotion): Promise<DebtGuidance> => {
  const ai = getAIInstance();
  const prompt = `Debt feeling: ${emotion}. Provide a comfort Ayah and a Prophetic Dua focus for barakah in rizq and debt relief. Return JSON. PLAIN TEXT ONLY.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          comfortAyah: { type: Type.OBJECT, properties: { arabic: { type: Type.STRING }, translation: { type: Type.STRING }, reference: { type: Type.STRING } }, required: ["arabic", "translation", "reference"] },
          duaFocus: { type: Type.OBJECT, properties: { arabic: { type: Type.STRING }, translation: { type: Type.STRING } }, required: ["arabic", "translation"] }
        },
        required: ["comfortAyah", "duaFocus"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

// Generate art/vision images
export const generateImage = async (prompt: string, aspectRatio: string, sourceImage?: { data: string, mimeType: string }) => {
  // Create a fresh instance right before call for image gen as per requirements
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Mandatory Islamic theme steering
  const islamicSteering = "Create a high-quality, spiritually uplifting, and strictly Islamic-themed image. Focus on Islamic architecture (mosques, courtyards), sacred geometry, peaceful spiritual landscapes, or beautiful illuminated Quranic themes. DO NOT generate human faces or animals if possible, focus on environment and pattern. Strictly NO offensive, immodest, or non-Islamic content.";
  const finalPrompt = `${islamicSteering} Subject: ${prompt}`;

  const contents: any = { parts: [{ text: finalPrompt }] };
  if (sourceImage) {
    contents.parts.push({ inlineData: { data: sourceImage.data, mimeType: sourceImage.mimeType } });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
      config: {
        imageConfig: { aspectRatio: aspectRatio as any }
      }
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from Vision AI.");
    }

    const parts = response.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e: any) {
    console.error("Art generation service error:", e);
    throw e; // Rethrow to let component handle key selection logic
  }
};

// Perform deep dive on scholarly academy topics
export const generateScholarDeepDive = async (topic: string, point: string) => {
  const ai = getAIInstance();
  const prompt = `Perform a deep scholarly analysis on this Academy topic: ${topic}. Specifically focus on the methodology point: ${point}. Cite evidence from classical sources. PLAIN TEXT ONLY. NO MARKDOWN.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { systemInstruction: "You are the Noor Scholarly Engine, specializing in advanced Sharia sciences." }
  });
  return response.text || "";
};
