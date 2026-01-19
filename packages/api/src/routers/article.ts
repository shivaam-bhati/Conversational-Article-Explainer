import { z } from "zod";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../index";

// Article parsing procedure
export const articleRouter = router({
  parseArticle: publicProcedure
    .input(
      z.object({
        url: z.string().url().optional(),
        text: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      let content = "";

      if (input.text) {
        content = input.text;
      } else if (input.url) {
        try {
          // Fetch the URL
          const response = await fetch(input.url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
          });

          if (!response.ok) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Failed to fetch URL: ${response.status} ${response.statusText}`,
            });
          }

          const html = await response.text();

          // Parse with Readability
          const dom = new JSDOM(html, {
            url: input.url,
          });

          const reader = new Readability(dom.window.document);
          const article = reader.parse();

          if (!article) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Could not extract article content from URL",
            });
          }

          content = article.textContent || article.content || "";
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to parse URL: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either URL or text must be provided",
        });
      }

      // Simple paragraph-based chunking
      const chunks = content
        .split(/\n\s*\n/)
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk.length > 0);

      if (chunks.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No content found to chunk",
        });
      }

      return {
        chunks,
        totalChunks: chunks.length,
      };
    }),
});
