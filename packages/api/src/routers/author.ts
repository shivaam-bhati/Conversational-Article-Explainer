import { z } from "zod";
import OpenAI from "openai";
import { publicProcedure, router } from "../index";
import { env } from "@conversational-article-explainer/env/server";

// Use OpenRouter if API key is provided, otherwise fall back to OpenAI
const apiKey = env.OPENROUTER_API_KEY || env.OPENAI_API_KEY;

const openai = apiKey
  ? new OpenAI({
      apiKey: apiKey,
      baseURL: env.OPENROUTER_API_KEY
        ? "https://openrouter.ai/api/v1"
        : undefined,
    })
  : null;

// Author style profile interface
export interface AuthorStyleProfile {
  name: string;
  vocabulary: string[];
  sentencePatterns: string[];
  analogies: string[];
  tone: string;
  explanationStyle: string;
  personality: string[];
  sampleQuotes: string[];
}

export const authorRouter = router({
  // Search for author content (transcripts, interviews, etc.)
  searchAuthorContent: publicProcedure
    .input(
      z.object({
        authorName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Implement actual web search
      // For MVP, we'll use LLM to generate search queries and simulate finding content
      // In production, integrate with:
      // - YouTube API for transcripts
      // - SerpAPI/Google Custom Search for interviews
      // - Podcast RSS feeds
      
      if (!openai) {
        throw new Error("OpenAI/OpenRouter API key not configured");
      }

      // Generate search queries for the author
      const searchQueryPrompt = `Generate 5 specific search queries to find interviews, podcasts, and speeches by "${input.authorName}". 
Focus on:
- Podcast interviews
- YouTube videos with transcripts
- Public speeches and talks
- Interview transcripts

Return only the search queries, one per line, without numbering.`;

      const searchResponse = await openai.chat.completions.create({
        model: env.OPENROUTER_API_KEY ? "openai/gpt-4o-mini" : "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: searchQueryPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const searchQueries =
        searchResponse.choices[0]?.message?.content
          ?.split("\n")
          .filter((q) => q.trim().length > 0) || [];

      // For MVP, return mock data structure
      // In production, actually fetch transcripts from these queries
      return {
        authorName: input.authorName,
        searchQueries,
        transcripts: [], // Will be populated with actual transcripts
        sources: [], // URLs of found content
        message:
          "Author search completed. Style analysis will use generated search queries.",
      };
    }),

  // Analyze author style from transcripts
  analyzeAuthorStyle: publicProcedure
    .input(
      z.object({
        authorName: z.string().min(1),
        transcripts: z.array(z.string()).optional(),
        // For MVP, if no transcripts provided, use LLM knowledge
        useLLMKnowledge: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      if (!openai) {
        throw new Error("OpenAI/OpenRouter API key not configured");
      }

      const model = env.OPENROUTER_API_KEY
        ? "openai/gpt-4o-mini"
        : "gpt-4o-mini";

      let analysisPrompt = `Analyze the speaking and writing style of "${input.authorName}".

`;

      if (input.transcripts && input.transcripts.length > 0) {
        // Analyze from actual transcripts
        const combinedTranscripts = input.transcripts
          .slice(0, 5)
          .join("\n\n---\n\n");
        analysisPrompt += `Based on these transcripts of ${input.authorName}'s interviews, podcasts, and speeches:

${combinedTranscripts}

`;
      } else if (input.useLLMKnowledge) {
        // Use LLM's knowledge about the author
        analysisPrompt += `Based on your knowledge of ${input.authorName}'s public interviews, podcasts, and speeches, `;
      }

      analysisPrompt += `Analyze and extract their unique speaking style. Provide a detailed analysis in the following JSON format:

{
  "vocabulary": ["list of 10-15 characteristic words or phrases they frequently use"],
  "sentencePatterns": ["list of 5-7 typical sentence structures or patterns"],
  "analogies": ["list of 3-5 types of analogies or examples they commonly use"],
  "tone": "description of their tone (e.g., 'casual and energetic', 'thoughtful and measured')",
  "explanationStyle": "description of how they explain complex topics (e.g., 'uses simple analogies', 'breaks down step by step')",
  "personality": ["list of 5-7 key personality traits visible in their communication"],
  "sampleQuotes": ["3-5 example quotes that represent their speaking style"]
}

Be specific and accurate. Focus on what makes their communication style unique.`;

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert at analyzing communication styles. Provide accurate, detailed analysis in valid JSON format only.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 1500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Failed to generate style analysis");
      }

      try {
        const styleProfile = JSON.parse(content) as AuthorStyleProfile;
        
        // Validate and ensure all fields are present
        const profile: AuthorStyleProfile = {
          name: input.authorName,
          vocabulary: Array.isArray(styleProfile.vocabulary)
            ? styleProfile.vocabulary
            : [],
          sentencePatterns: Array.isArray(styleProfile.sentencePatterns)
            ? styleProfile.sentencePatterns
            : [],
          analogies: Array.isArray(styleProfile.analogies)
            ? styleProfile.analogies
            : [],
          tone: styleProfile.tone || "conversational",
          explanationStyle: styleProfile.explanationStyle || "clear and direct",
          personality: Array.isArray(styleProfile.personality)
            ? styleProfile.personality
            : [],
          sampleQuotes: Array.isArray(styleProfile.sampleQuotes)
            ? styleProfile.sampleQuotes
            : [],
        };

        return {
          profile,
          source: input.transcripts && input.transcripts.length > 0
            ? "transcripts"
            : "llm_knowledge",
        };
      } catch (error) {
        throw new Error(
          `Failed to parse style analysis: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  // Combined: Search and analyze in one call (convenience method)
  getAuthorStyle: publicProcedure
    .input(
      z.object({
        authorName: z.string().min(1),
        useLLMKnowledge: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      // For MVP, skip actual transcript fetching and use LLM knowledge
      // In production, this would:
      // 1. Search for author content
      // 2. Fetch transcripts
      // 3. Analyze style from transcripts

      // Simply call analyzeAuthorStyle logic directly
      if (!openai) {
        throw new Error("OpenAI/OpenRouter API key not configured");
      }

      const model = env.OPENROUTER_API_KEY
        ? "openai/gpt-4o-mini"
        : "gpt-4o-mini";

      const analysisPrompt = `Analyze the speaking and writing style of "${input.authorName}".

Based on your knowledge of ${input.authorName}'s public interviews, podcasts, and speeches, analyze and extract their unique speaking style. Provide a detailed analysis in the following JSON format:

{
  "vocabulary": ["list of 10-15 characteristic words or phrases they frequently use"],
  "sentencePatterns": ["list of 5-7 typical sentence structures or patterns"],
  "analogies": ["list of 3-5 types of analogies or examples they commonly use"],
  "tone": "description of their tone (e.g., 'casual and energetic', 'thoughtful and measured')",
  "explanationStyle": "description of how they explain complex topics (e.g., 'uses simple analogies', 'breaks down step by step')",
  "personality": ["list of 5-7 key personality traits visible in their communication"],
  "sampleQuotes": ["3-5 example quotes that represent their speaking style"]
}

Be specific and accurate. Focus on what makes their communication style unique.`;

      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert at analyzing communication styles. Provide accurate, detailed analysis in valid JSON format only.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Failed to generate style analysis");
      }

      try {
        const styleProfile = JSON.parse(content) as AuthorStyleProfile;
        
        const profile: AuthorStyleProfile = {
          name: input.authorName,
          vocabulary: Array.isArray(styleProfile.vocabulary)
            ? styleProfile.vocabulary
            : [],
          sentencePatterns: Array.isArray(styleProfile.sentencePatterns)
            ? styleProfile.sentencePatterns
            : [],
          analogies: Array.isArray(styleProfile.analogies)
            ? styleProfile.analogies
            : [],
          tone: styleProfile.tone || "conversational",
          explanationStyle: styleProfile.explanationStyle || "clear and direct",
          personality: Array.isArray(styleProfile.personality)
            ? styleProfile.personality
            : [],
          sampleQuotes: Array.isArray(styleProfile.sampleQuotes)
            ? styleProfile.sampleQuotes
            : [],
        };

        return {
          authorName: input.authorName,
          profile,
          source: "llm_knowledge",
        };
      } catch (error) {
        throw new Error(
          `Failed to parse style analysis: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),
});
