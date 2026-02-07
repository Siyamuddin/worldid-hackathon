
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const getHumanityChallenge = async () => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Generate a short, unique question that requires human emotional intelligence or a lived physical experience to answer correctly. One sentence only. The goal is to verify if a user is human.",
    config: {
      systemInstruction: "You are the Gatekeeper for the INHUMAN protocol, a security system that only allows biologically verified humans access. Be cold, clinical, and precise.",
    }
  });
  return response.text || "Describe the feeling of a cold breeze on a warm summer evening.";
};

export const verifyHumanity = async (question: string, answer: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Question: ${question}\nUser Answer: ${answer}`,
    config: {
      systemInstruction: "You are a 'Humanity Auditor'. Evaluate the user's answer. If it sounds like an AI generated response or lacks human nuance, fail it. If it feels authentic to human experience, pass it. Respond in valid JSON format: { 'result': 'PASS' | 'FAIL', 'reason': 'short explanation' }",
      responseMimeType: "application/json"
    }
  });
  try {
    return JSON.parse(response.text);
  } catch (e) {
    return { result: 'FAIL', reason: 'Verification protocol error.' };
  }
};
