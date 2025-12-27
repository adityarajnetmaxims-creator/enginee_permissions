
import { GoogleGenAI } from "@google/genai";

export const generateJobSuggestions = async (machineName: string, reportedIssue: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found");
    return "Please check standard operating procedures for this machine type.";
  }

  try {
    // Initializing with named parameter as required by guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Fix: Using 'gemini-3-flash-preview' for basic text tasks as per model selection rules
    const model = 'gemini-3-flash-preview';
    
    const prompt = `
      You are an expert field engineer assistant.
      A technician is creating a work order for a machine.
      
      Machine Name/Type: ${machineName}
      Reported Issue: ${reportedIssue}
      
      Provide a concise, professional technical description for the work order, and a bulleted list of 3 likely troubleshooting steps.
      Keep it brief and actionable.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    // Fix: Accessing .text as a property (not a method) as per guidelines
    return response.text || "Unable to generate suggestions at this time.";
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return "AI assistance unavailable. Please proceed manually.";
  }
};
