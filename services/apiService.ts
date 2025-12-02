import { CrispeState, Language, GeneratedPrompts } from "../types";

const BASE_SYSTEM_INSTRUCTION = `
You are a Prompt Engineering Expert.
Your goal is to optimize user input into a professional prompt using the CRISPE framework (Context, Role, Instruction, Specifics, Process, Example).
Rules:
1. Role Hardening: Make the role expert-level.
2. Structure: Use Markdown headers.
3. Clarity: Start instructions with verbs.
`;

export const optimizePromptWithSiliconFlow = async (
  data: CrispeState, 
  language: Language,
  onProgress?: (text: string) => void
): Promise<GeneratedPrompts> => {
  
  if (onProgress) onProgress("Sending request to AI...");
  
  const SPLIT_MARKER = "==========DIVIDER==========";
  let systemInstruction = BASE_SYSTEM_INSTRUCTION;

  if (language === 'cn') {
    systemInstruction += `
OUTPUT INSTRUCTIONS:
You must generate TWO versions.
1. Chinese Version.
2. The exact separator line: "${SPLIT_MARKER}"
3. English Version.
Do NOT wrap in markdown code blocks.
`;
  } else {
    systemInstruction += `
OUTPUT INSTRUCTIONS:
Generate only the English version.
Do NOT wrap in markdown code blocks.
`;
  }

  const userMessage = `
Context: ${data.context || "N/A"}
Role: ${data.role || "N/A"}
Instruction: ${data.instruction || "N/A"}
Specifics: ${data.specifics || "N/A"}
Process: ${data.process || "N/A"}
Example: ${data.example || "N/A"}
`;

  try {
    const response = await fetch('/api/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userMessage }
        ]
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to connect to the server.");
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || "";

    if (language === 'cn') {
      const parts = text.split(SPLIT_MARKER);
      return {
        cn: parts[0]?.trim() || text,
        en: parts[1]?.trim() || ""
      };
    } else {
      return {
        en: text.trim(),
        cn: ""
      };
    }

  } catch (error) {
    console.error("Generation Error:", error);
    throw new Error("Failed to generate prompt. Please check your connection.");
  }
};