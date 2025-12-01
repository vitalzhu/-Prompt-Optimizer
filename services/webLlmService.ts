import { CreateMLCEngine, MLCEngine, InitProgressCallback } from "@mlc-ai/web-llm";
import { CrispeState, Language, GeneratedPrompts } from "../types";

// Using Qwen2.5-1.5B Instruct model (approx 1GB download, runs fast on WebGPU)
const SELECTED_MODEL = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";

let engine: MLCEngine | null = null;

const BASE_SYSTEM_INSTRUCTION = `
You are a Prompt Engineering Expert.
Your goal is to optimize user input into a professional prompt using the CRISPE framework (Context, Role, Instruction, Specifics, Process, Example).
Rules:
1. Role Hardening: Make the role expert-level.
2. Structure: Use Markdown headers.
3. Clarity: Start instructions with verbs.
`;

export const optimizePromptWithWebLLM = async (
  data: CrispeState, 
  language: Language,
  onProgress: (text: string) => void
): Promise<GeneratedPrompts> => {
  
  // 1. Initialize Engine if not ready
  if (!engine) {
    onProgress("Initializing WebGPU...");
    
    const initProgressCallback: InitProgressCallback = (report) => {
      onProgress(report.text);
    };

    try {
      engine = await CreateMLCEngine(
        SELECTED_MODEL,
        { initProgressCallback: initProgressCallback }
      );
    } catch (error) {
      console.error("WebLLM Init Error:", error);
      throw new Error("Failed to load the AI model. Your browser might not support WebGPU.");
    }
  }

  // 2. Prepare Prompt
  onProgress("Generating optimization...");
  
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
    const response = await engine.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 2048, 
    });

    const text = response.choices[0]?.message?.content || "";

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
    console.error("WebLLM Generation Error:", error);
    throw new Error("Failed to generate prompt. Please try again.");
  }
};
