import { z } from "zod";
import { publicProcedure, router } from "../index";
import { env } from "@conversational-article-explainer/env/server";
import Replicate from "replicate";

// Initialize Replicate client
const replicate = env.REPLICATE_API_KEY
  ? new Replicate({
      auth: env.REPLICATE_API_KEY,
    })
  : null;

// GPT-SoVITS model configuration
// Using the model provided by user
// Note: If this is a training model, you may need a separate inference model
// Check Replicate for the correct model for text-to-speech inference
const GPT_SOVITS_MODEL =
  "douwantech/gpt-sovits-train:d501141112f7a2fc5223942c6803dcfb8395559a01a507c682f74c775772d1f4";

async function generateSpeechWithGPTSoVITS(
  text: string,
  language: string = "en",
  referenceAudioUrl?: string
): Promise<{ audioUrl: string; format: string }> {
  if (!replicate) {
    throw new Error("REPLICATE_API_KEY not configured");
  }

  // This model requires a reference audio URL for voice cloning
  // If not provided, we'll throw an error and the caller can fallback to Web Speech API
  if (!referenceAudioUrl) {
    throw new Error(
      "Reference audio URL is required for GPT-SoVITS voice cloning. " +
      "Please provide an audio/video URL or use Web Speech API instead."
    );
  }

  try {
    // Call Replicate API using the SDK
    // Note: This model expects audio_or_video_url for training/cloning
    // For TTS inference, you might need a different model that accepts text input
    // Check the model's documentation on Replicate for correct input format
    const output = await replicate.run(GPT_SOVITS_MODEL, {
      input: {
        audio_or_video_url: referenceAudioUrl,
        aliyun_oss_configure: "", // Leave empty unless using Aliyun OSS
        // If this model supports text input for inference, add it here
        // Otherwise, you may need to use a different model for TTS
        ...(text && { text: text }),
        ...(language && { language: language }),
      },
    });

    console.log("GPT-SoVITS output:", output);

    // Handle different output formats
    // The output might be a URL, array of URLs, or object with audio URL
    let audioUrl: string;

    if (typeof output === "string") {
      audioUrl = output;
    } else if (Array.isArray(output)) {
      audioUrl = output[0];
    } else if (output && typeof output === "object" && "audio" in output) {
      audioUrl = (output as any).audio;
    } else if (output && typeof output === "object" && "url" in output) {
      audioUrl = (output as any).url;
    } else {
      throw new Error("Unexpected output format from GPT-SoVITS");
    }

    if (!audioUrl) {
      throw new Error("No audio URL returned from GPT-SoVITS");
    }

    return {
      audioUrl,
      format: "wav", // GPT-SoVITS typically outputs WAV
    };
  } catch (error) {
    console.error("GPT-SoVITS error:", error);
    throw new Error(
      `Failed to generate speech with GPT-SoVITS: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export const ttsRouter = router({
  // Generate speech using GPT-SoVITS
  generateSpeech: publicProcedure
    .input(
      z.object({
        text: z.string().min(1),
        language: z.string().default("en"),
        authorName: z.string().optional(),
        referenceAudioUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await generateSpeechWithGPTSoVITS(
          input.text,
          input.language,
          input.referenceAudioUrl
        );

        return {
          audioUrl: result.audioUrl,
          format: result.format,
          method: "gpt-sovits",
        };
      } catch (error) {
        // Fallback to Web Speech API if GPT-SoVITS fails
        return {
          error: error instanceof Error ? error.message : "Unknown error",
          fallback: "web-speech-api",
          message: "GPT-SoVITS unavailable, use browser TTS instead",
        };
      }
    }),

  // Get reference audio URL for an author
  // For now, returns a placeholder - in production, this would:
  // 1. Search for author's YouTube videos/podcasts
  // 2. Extract audio (5-10 seconds)
  // 3. Upload to storage (S3, Cloudinary, etc.)
  // 4. Return URL
  getAuthorAudioSample: publicProcedure
    .input(
      z.object({
        authorName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Implement actual audio sample fetching
      // For MVP, you can manually provide a test audio URL
      // Example: Use a publicly accessible audio/video URL
      
      return {
        authorName: input.authorName,
        audioUrl: null, // Will be populated when audio extraction is implemented
        message: "Audio sample not available. Please provide a reference audio URL manually for testing.",
      };
    }),

  // Test GPT-SoVITS with a provided audio URL
  testGPTSoVITS: publicProcedure
    .input(
      z.object({
        text: z.string().min(1),
        audioUrl: z.string().url(),
        language: z.string().default("en"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await generateSpeechWithGPTSoVITS(
          input.text,
          input.language,
          input.audioUrl
        );

        return {
          success: true,
          audioUrl: result.audioUrl,
          format: result.format,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
});
