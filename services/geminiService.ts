import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, AIAnalysisResponse, SkillCategory } from "../types";

const handleApiError = (error: any): never => {
  console.error("Gemini API Error Detail:", error);
  const message = error.message || "";
  const status = error.status || (message.match(/\b(401|403|429|500|503)\b/) || [])[0];
  
  if (status == "429") {
    throw new Error("Rate limit reached! Please wait 60 seconds.");
  }
  
  // Check for API key errors
  if (message.includes("API key") || message.includes("API_KEY") || message.includes("INVALID_ARGUMENT")) {
    throw new Error("API key not configured. Please add a valid Gemini API key.");
  }
  
  throw new Error("AI service temporarily unavailable. Try again later.");
};

export const analyzeResume = async (data: ResumeData): Promise<AIAnalysisResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    
    const prompt = `
      Analyze and optimize the following resume data.
      Job Context: ${data.targetJobDescription || 'N/A'}
      
      Current Data:
      ${JSON.stringify(data, null, 2)}
      
      Instructions:
      1. Write a high-impact summary.
      2. Categorize and optimize skills.
      3. Rewrite experience/project bullets to start with action verbs and include metrics. 
      4. Ensure proper capitalization (e.g., companies like TCS, FAANG, NASA, AWS should be uppercase).
      5. Standardize job titles and location names to Title Case.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            optimizedSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  skills: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["id", "name", "skills"]
              }
            },
            improvedExperience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  description: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["id", "description"]
              }
            },
            improvedProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  description: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["id", "description"]
              }
            },
            score: {
              type: Type.OBJECT,
              properties: {
                ats: { type: Type.NUMBER },
                readability: { type: Type.NUMBER },
                depth: { type: Type.NUMBER },
                feedback: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["ats", "readability", "depth", "feedback"]
            }
          },
          required: ["summary", "optimizedSkills", "score"]
        }
      }
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) throw new Error("AI returned empty.");
    return JSON.parse(jsonStr);
  } catch (error: any) {
    return handleApiError(error);
  }
};

/**
 * Refines or generates professional resume text blocks.
 */
export const refineTextWithAI = async (text: string, context: string = ""): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const isGeneration = !text.trim();
    
    const prompt = isGeneration 
      ? `Generate 3 high-impact, metric-driven professional resume bullet points for the role: ${context}. Use strong action verbs. Ensure professional acronyms (like TCS, AWS, CEO) are fully uppercase. Return ONLY the bullets, one per line.`
      : `Refine this professional text for maximum impact and strictly correct professional capitalization (e.g. TCS, NASA, AWS, CEO). Text: "${text}". Context: ${context}. Return ONLY the refined text. If multiple points, return them one per line.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text?.trim() || text;
  } catch (e) {
    console.error("AI Refinement Failure:", e);
    return text;
  }
};

/**
 * Suggests skills based on existing resume content.
 */
export const getSkillSuggestions = async (data: Partial<ResumeData>): Promise<{ technical: string[], soft: string[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const context = `
      Target Job Description: ${data.targetJobDescription || 'N/A'}
      Job Title: ${data.personalInfo?.jobTitle || 'Professional'}
      Summary: ${data.summary || 'N/A'}
      Experience: ${data.experience?.map(e => `${e.role} at ${e.company}`).join(', ') || 'N/A'}
      Projects: ${data.projects?.map(p => p.name).join(', ') || 'N/A'}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this resume context, suggest 10 highly relevant Technical Skills and 6 Soft Skills that would improve ATS score. 
      If the context is minimal, suggest skills for a modern professional in the tech/business industry.
      Context: ${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            technical: { type: Type.ARRAY, items: { type: Type.STRING } },
            soft: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["technical", "soft"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"technical":[], "soft":[]}');
    return result;
  } catch (e) {
    console.error("Skill Suggestion Failure:", e);
    // Return empty arrays so UI handles it gracefully
    return { technical: [], soft: [] };
  }
};