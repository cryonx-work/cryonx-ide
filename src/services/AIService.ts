import { GoogleGenAI } from '@google/genai';
import { AI_CONFIG } from '@/config/ai';

let dynamicApiKey: string | null = null;

export const setDynamicApiKey = (key: string) => {
  dynamicApiKey = key;
};

export const hasApiKey = (): boolean => {
  return !!(dynamicApiKey);
};

const getClient = () => {
  const apiKey = dynamicApiKey;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const auditSmartContract = async (code: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `You are an expert Move Language Smart Contract Auditor for the Cedra Network. 
    Please audit the following Move code for resource management safety, access control vulnerabilities, and logic errors.
    Provide the output in Markdown format with clear headers for "Critical", "Major", "Minor", and "Informational" findings.
    
    Code:
    \`\`\`move
    ${code}
    \`\`\`
    `;

    const response = await ai.models.generateContent({
      model: AI_CONFIG.MODEL_NAME,
      contents: prompt,
    });

    return response.text || AI_CONFIG.NO_RESPONSE_MESSAGE;
  } catch (error) {
    return AI_CONFIG.DEFAULT_ERROR_MESSAGE;
  }
};

export const explainCode = async (code: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `Explain the following Move Language code snippet concisely for a developer building on Cedra Network:
      \`\`\`move
      ${code}
      \`\`\`
      `;

    const response = await ai.models.generateContent({
      model: AI_CONFIG.MODEL_NAME,
      contents: prompt,
    });

    return response.text || AI_CONFIG.NO_RESPONSE_MESSAGE;
  } catch (error) {
    return "Error explaining code.";
  }
};

export const chatWithAI = async (message: string, contextCode: string): Promise<string> => {
  try {
    const ai = getClient();
    const systemInstruction = `You are "CryonxAI", a helpful assistant for the Cedra Network IDE. 
        You specialize in the Move programming language.
        Always prefer Move syntax over Solidity when providing examples.
        Current file context:
        ${contextCode}
        `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: { systemInstruction }
    });

    return response.text || "I'm not sure how to answer that.";
  } catch (error: any) {
    if (error.message?.includes("API key not valid") || error.status === "INVALID_ARGUMENT") {
      throw new Error("INVALID_API_KEY");
    }
    return "System error: Unable to connect to CryonxAI.";
  }
}