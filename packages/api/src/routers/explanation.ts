import { z } from "zod";
import OpenAI from "openai";
import { publicProcedure, router } from "../index";
import { env } from "@conversational-article-explainer/env/server";

// Use OpenRouter if API key is provided, otherwise fall back to OpenAI
const apiKey = env.OPENROUTER_API_KEY || env.OPENAI_API_KEY;

// Debug logging (remove in production)
if (process.env.NODE_ENV === "development") {
  console.log("API Key check:", {
    hasOpenRouterKey: !!env.OPENROUTER_API_KEY,
    hasOpenAIKey: !!env.OPENAI_API_KEY,
    openRouterKeyLength: env.OPENROUTER_API_KEY?.length || 0,
    openAIKeyLength: env.OPENAI_API_KEY?.length || 0,
  });
}

const openai = apiKey
  ? new OpenAI({
      apiKey: apiKey,
      baseURL: env.OPENROUTER_API_KEY
        ? "https://openrouter.ai/api/v1"
        : undefined, // Use default OpenAI base URL if not using OpenRouter
    })
  : null;

// Language names for prompts
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  hi: "Hindi",
  zh: "Chinese",
  ja: "Japanese",
};

export const explanationRouter = router({
  explainChunk: publicProcedure
    .input(
      z.object({
        chunk: z.string(),
        chunkIndex: z.number(),
        previousExplanations: z.array(z.string()).optional(),
        language: z.string().default("en"),
        userQuestion: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!openai) {
        throw new Error(
          `OpenAI/OpenRouter API key not configured. Please set OPENROUTER_API_KEY or OPENAI_API_KEY in your .env file. Current check: OPENROUTER_API_KEY=${env.OPENROUTER_API_KEY ? "set" : "not set"}, OPENAI_API_KEY=${env.OPENAI_API_KEY ? "set" : "not set"}`
        );
      }

      const languageName = LANGUAGE_NAMES[input.language] || "English";
      const previousContext = input.previousExplanations
        ? input.previousExplanations.join("\n\n")
        : "";

      let systemPrompt = `You are explaining an article to someone in ${languageName}. Your goal is to help them understand the content deeply, not just summarize it.

Guidelines:
- Explain like a knowledgeable friend would, in ${languageName}
- Use simple language, avoid jargon unless you explain it
- Add context from previous parts when relevant
- Explain *why* things matter, not just *what* they are
- Use analogies when helpful
- Be conversational and natural
- If the user asks a question, answer it directly and naturally`;

      let userPrompt = "";

      if (input.userQuestion) {
        // Answer a user question
        userPrompt = `The user is reading an article. You've already explained these parts:

${previousContext || "This is the beginning of the article."}

Current focus (chunk ${input.chunkIndex + 1}): ${input.chunk}

User asked: ${input.userQuestion}

Answer their question naturally in ${languageName}, then ask if they want to continue with the article.`;
      } else {
        // Explain the current chunk
        userPrompt = `You are explaining an article to someone in ${languageName}. 

${previousContext ? `You've already explained:\n\n${previousContext}\n\n` : "This is the beginning of the article. "}Now explain this part (chunk ${input.chunkIndex + 1}):

${input.chunk}

Explain it conversationally in ${languageName}. After your explanation, end with: "Does that make sense, or would you like me to clarify anything?" (in ${languageName})`;
      }

      // Use OpenRouter's model format if using OpenRouter
      const model = env.OPENROUTER_API_KEY
        ? "openai/gpt-4o-mini" // OpenRouter format: provider/model-name
        : "gpt-4o-mini"; // Direct OpenAI format

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const explanation = response.choices[0]?.message?.content;
      if (!explanation) {
        throw new Error("Failed to generate explanation");
      }

      return {
        explanation,
        chunkIndex: input.chunkIndex,
      };
    }),
});
