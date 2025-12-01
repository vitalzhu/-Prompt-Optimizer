import { GoogleGenAI } from "@google/genai";
import { CrispeState, Language, GeneratedPrompts } from "../types";

const BASE_SYSTEM_INSTRUCTION = `
# Role
You are a world-class **Prompt Engineering Expert**. Your task is to assist users in transforming rough ideas into perfectly structured, logically tight, and highly executable AI prompts.

# Objective
The user will provide input via the **CRISPE Framework**. You must analyze this information, polish, expand, and optimize it, and finally output a professional prompt ready for copying.

# CRISPE Framework Definition
1. **C (Context):** Task background.
2. **R (Role):** Expected AI role.
3. **I (Instruction):** Core commands.
4. **S (Specifics):** Style, format, constraints.
5. **P (Process):** Execution steps.
6. **E (Example):** Reference examples.

# Optimization Rules
1. **Role Hardening:** Upgrade simple roles to expert-level descriptions.
2. **Instruction Clarification:** Convert instructions into clear, verb-starting commands.
3. **Structuring:** Use Markdown headers, bullet points, and separators.
4. **Gap Filling:** Infer missing Context or Specifics if possible. If Process is missing for complex tasks, add a Chain of Thought (CoT).
5. **CoT Injection:** For logical tasks, add "Think step-by-step".
`;

export const optimizePromptWithGemini = async (data: CrispeState, language: Language): Promise<GeneratedPrompts> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let systemInstruction = BASE_SYSTEM_INSTRUCTION;
    const SPLIT_MARKER = "==========DIVIDER==========";

    // Special instruction for Chinese Mode: Dual Output
    if (language === 'cn') {
      systemInstruction += `
# OUTPUT REQUIREMENT (Chinese Mode)
You MUST generate **TWO VERSIONS** of the optimized prompt:
1. **Chinese Version**: A fully optimized version in Chinese.
2. **English Version**: A fully optimized version in English.

IMPORTANT FORMATTING RULES:
1. Output the Chinese Version first.
2. Output exactly the string "${SPLIT_MARKER}" on a new line.
3. Output the English Version second.
4. **DO NOT** wrap the output in Markdown code blocks (like \`\`\`markdown). Just output the raw text content.
5. Use internal markdown syntax (headers like #, ##, bullets like -) for the content itself to ensure good structure.
      `;
    } else {
        systemInstruction += `
# Output Format
Directly output the generated prompt. 
**DO NOT** wrap the output in Markdown code blocks (like \`\`\`markdown). Just output the raw text content.
Use internal markdown syntax (headers like #, ##, bullets like -) to ensure good structure.
Structure:
# Role: [Optimized Role]

# Context
[Optimized Context]

# Task
[Clear Instructions]

# Constraints & Style
[Specific Constraints]

# Workflow (Optional)
[Suggested Steps]

# Examples (Optional)
[Formatted Examples]
`;
    }

    // Construct the user input string
    const userMessage = `
# User Input Data (CRISPE)
1. **Context:** ${data.context || "N/A"}
2. **Role:** ${data.role || "N/A"}
3. **Instruction:** ${data.instruction || "N/A"}
4. **Specifics:** ${data.specifics || "N/A"}
5. **Process:** ${data.process || "N/A"}
6. **Example:** ${data.example || "N/A"}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, 
      },
    });

    const text = response.text || "";

    if (language === 'cn') {
      const parts = text.split(SPLIT_MARKER);
      return {
        cn: parts[0]?.trim() || text, // Fallback to full text if split fails
        en: parts[1]?.trim() || ""    // Might be empty if split fails
      };
    } else {
      return {
        en: text.trim(),
        cn: ""
      };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with the AI service.");
  }
};
