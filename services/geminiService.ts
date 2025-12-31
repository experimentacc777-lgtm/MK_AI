
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MODELS, SYSTEM_INSTRUCTION } from "../constants";
import { Intent } from "../types";
import { applyWatermark } from "./imageService";

/**
 * Creates a fresh instance of the AI client using the current environment key.
 */
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Detects the user's intent based on text and presence of image.
 */
export const detectIntent = async (text: string, hasImage: boolean): Promise<Intent> => {
  if (hasImage) {
    const lower = text.toLowerCase();
    if (lower.includes('edit') || lower.includes('change') || lower.includes('add') || lower.includes('remove')) {
      return Intent.IMAGE_EDIT;
    }
    return Intent.IMAGE_ANALYZE;
  }

  const prompt = `
    Classify the user intent into one of these: SEARCH, IMAGE_GEN, CHAT.
    - IMAGE_GEN: Requesting to draw, create, show, or generate an image/picture.
    - SEARCH: Factual queries, news, weather, "who is", "what is", history, research.
    - CHAT: Casual conversation, greetings, simple logic.

    Input: "${text}"
    Output ONLY the enum value.
  `;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: MODELS.TEXT,
      contents: prompt,
      config: { temperature: 0 }
    });
    const result = response.text?.trim() as Intent;
    return Object.values(Intent).includes(result) ? result : Intent.CHAT;
  } catch (error) {
    console.error("Intent Detection Failed:", error);
    return Intent.CHAT;
  }
};

/**
 * Main handler that executes the detected intent.
 */
export const processUserRequest = async (
  text: string, 
  intent: Intent, 
  imageUri?: string
): Promise<{ text?: string; imageUrl?: string; sources?: any[] }> => {
  const ai = getAIClient();
  
  if (intent === Intent.IMAGE_GEN) {
    const response = await ai.models.generateContent({
      model: MODELS.IMAGE,
      contents: text || 'A beautiful creative illustration',
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    
    let base64 = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) base64 = `data:image/png;base64,${part.inlineData.data}`;
    }
    
    if (base64) {
      const watermarked = await applyWatermark(base64);
      return { imageUrl: watermarked };
    }
    return { text: "I tried generating that image but something went wrong. Could you try a different description?" };
  }

  if (intent === Intent.IMAGE_EDIT && imageUri) {
    const base64Clean = imageUri.split(',')[1];
    const response = await ai.models.generateContent({
      model: MODELS.IMAGE,
      contents: {
        parts: [
          { inlineData: { data: base64Clean, mimeType: 'image/png' } },
          { text: text || 'Enhance this image' }
        ]
      }
    });

    let base64 = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) base64 = `data:image/png;base64,${part.inlineData.data}`;
    }

    if (base64) {
      const watermarked = await applyWatermark(base64);
      return { imageUrl: watermarked };
    }
    return { text: "I couldn't process the edit. Please try again with clear instructions." };
  }

  if (intent === Intent.IMAGE_ANALYZE && imageUri) {
     const base64Clean = imageUri.split(',')[1];
     const response = await ai.models.generateContent({
      model: MODELS.TEXT,
      contents: {
        parts: [
          { inlineData: { data: base64Clean, mimeType: 'image/png' } },
          { text: text || 'Describe this image in detail.' }
        ]
      }
    });
    return { text: response.text };
  }

  // CHAT or SEARCH
  const isSearch = intent === Intent.SEARCH;
  const response = await ai.models.generateContent({
    model: MODELS.TEXT,
    contents: text,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: isSearch ? [{ googleSearch: {} }] : undefined
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Source',
    uri: chunk.web?.uri || '#'
  })).filter((s: any) => s.uri !== '#');

  return { text: response.text, sources };
};
