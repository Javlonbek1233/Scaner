import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getHealthInsights(userData: any, logs: any[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a futuristic health AI assistant. Based on this user data and recent health logs, provide 3 short, actionable health tips and a summary of their current status.
      User Goals: Water ${userData.dailyWaterGoal || 2000}ml, Sleep ${userData.dailySleepGoal || 8}h.
      Recent Logs: ${JSON.stringify(logs.slice(0, 10))}
      Output format: JSON with "summary" (string) and "tips" (array of strings).`,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return { summary: "Analyzing your data...", tips: ["Keep tracking your daily metrics for better insights."] };
  }
}

export async function getMoodRecommendation(mood: number, notes: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User mood (1-10): ${mood}. Notes: ${notes}. Provide a futuristic, medical-style recommendation to improve or maintain this mood. Max 2 sentences.`,
    });
    return response.text;
  } catch (error) {
    return "Stay hydrated and maintain optimal neural balance.";
  }
}

export async function chatWithDoctor(message: string, history: { role: "user" | "model", parts: string }[]) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are the NeuroScan AI Chatbot Doctor. You provide futuristic medical advice in a professional, technical, yet empathetic tone. You focus on habit optimization and disease prevention. Always maintain the 'NeuroScan AI' persona.",
      },
      history: history.map(h => ({ role: h.role, parts: [{ text: h.parts }] })),
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I am currently processing high-priority neural data. Please try again in a moment.";
  }
}
