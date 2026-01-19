"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VoiceOutput } from "./voice-output";
import { VoiceInput } from "./voice-input";
import { QuestionHandler } from "./question-handler";
import { useConversation } from "@/contexts/conversation-context";
import { trpcClient } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { Loader2, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useAuthorStyle } from "@/hooks/use-author-style";

export function ExplanationView() {
  const { state, setCurrentChunk, addExplanation, setAuthorStyleProfile } =
    useConversation();
  const [currentExplanation, setCurrentExplanation] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);

  const { profile: authorStyleProfile, isLoading: isLoadingAuthorStyle } =
    useAuthorStyle(state?.authorName);

  useEffect(() => {
    if (
      authorStyleProfile &&
      state?.authorName &&
      state.authorName === authorStyleProfile.name
    ) {
      const currentProfile = state.authorStyleProfile;
      if (
        !currentProfile ||
        currentProfile.name !== authorStyleProfile.name ||
        JSON.stringify(currentProfile) !== JSON.stringify(authorStyleProfile)
      ) {
        setAuthorStyleProfile(authorStyleProfile);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorStyleProfile?.name, state?.authorName]);

  const explainMutation = useMutation({
    mutationFn: async (input: {
      chunk: string;
      chunkIndex: number;
      previousExplanations?: string[];
      language: string;
      userQuestion?: string;
      authorName?: string;
      authorStyleProfile?: {
        name: string;
        vocabulary: string[];
        sentencePatterns: string[];
        analogies: string[];
        tone: string;
        explanationStyle: string;
        personality: string[];
        sampleQuotes: string[];
      };
    }) => {
      return await trpcClient.explanation.explainChunk.mutate(input);
    },
  });

  if (!state) return null;

  const currentChunk = state.chunks[state.currentChunkIndex];
  const hasExplanation = state.explanations[state.currentChunkIndex] !== undefined;
  const isFirstChunk = state.currentChunkIndex === 0;
  const isLastChunk = state.currentChunkIndex === state.chunks.length - 1;

  const generateExplanation = async () => {
    if (!currentChunk) return;

    setIsGenerating(true);
    try {
      const previousExplanations = Object.keys(state.explanations)
        .toSorted((a, b) => Number(a) - Number(b))
        .map((key) => state.explanations[Number(key)]);

      const profileToUse = state.authorStyleProfile || authorStyleProfile;

      const result = await explainMutation.mutateAsync({
        chunk: currentChunk,
        chunkIndex: state.currentChunkIndex,
        previousExplanations,
        language: state.language,
        authorName: state.authorName,
        authorStyleProfile: profileToUse || undefined,
      });

      addExplanation(state.currentChunkIndex, result.explanation);
      setCurrentExplanation(result.explanation);
    } catch (error) {
      console.error("Failed to generate explanation:", error);
      toast.error("Couldn’t generate explanation. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (currentChunk && !hasExplanation && !isGenerating) {
      generateExplanation();
    } else if (hasExplanation) {
      setCurrentExplanation(state.explanations[state.currentChunkIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentChunkIndex, currentChunk]);

  const handleNext = () => {
    if (state.currentChunkIndex < state.chunks.length - 1) {
      setCurrentChunk(state.currentChunkIndex + 1);
      setCurrentExplanation("");
    }
  };

  const handlePrevious = () => {
    if (state.currentChunkIndex > 0) {
      setCurrentChunk(state.currentChunkIndex - 1);
      const prevExplanation = state.explanations[state.currentChunkIndex - 1];
      setCurrentExplanation(prevExplanation || "");
    }
  };

  const handleReplay = () => {
    if (hasExplanation) {
      setCurrentExplanation(state.explanations[state.currentChunkIndex]);
    }
  };

  const handleCommand = (command: string) => {
    switch (command) {
      case "continue":
      case "next":
        handleNext();
        break;
      case "previous":
        handlePrevious();
        break;
      case "repeat":
        handleReplay();
        break;
      case "stop":
        break;
      default:
        break;
    }
  };

  const handleQuestion = (question: string) => setCurrentQuestion(question);
  const handleQuestionComplete = () => setCurrentQuestion(null);

  const progress = ((state.currentChunkIndex + 1) / state.chunks.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <section aria-label="Progress" className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Section {state.currentChunkIndex + 1} of {state.chunks.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              onClick={handlePrevious}
              disabled={isFirstChunk}
              variant="outline"
              size="icon-sm"
              className="border-primary/35 hover:bg-primary/10 hover:border-primary/50 disabled:opacity-50 transition-colors"
              aria-label="Previous section"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLastChunk}
              variant="outline"
              size="icon-sm"
              className="border-primary/35 hover:bg-primary/10 hover:border-primary/50 disabled:opacity-50 transition-colors"
              aria-label="Next section"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      {/* Chunk preview */}
      <section aria-label="Current section" className="accent-stripe rounded-lg border border-border bg-muted/40 p-4 pl-5">
        <p className="text-sm text-foreground/90 leading-relaxed line-clamp-4">
          {currentChunk}
        </p>
      </section>

      {/* Author style loading */}
      {isLoadingAuthorStyle && state.authorName && (
        <div className="accent-stripe flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 pl-5">
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
          <span className="text-sm text-foreground">
            Learning {state.authorName}&apos;s style…
          </span>
        </div>
      )}

      {/* Explanation / voice output */}
      <section aria-label="Explanation">
        {isGenerating ? (
          <div className="accent-stripe flex items-center gap-3 rounded-lg border border-border bg-card p-5 pl-6">
            <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              {state.authorName
                ? `Explaining in ${state.authorName}'s style…`
                : "Generating explanation…"}
            </span>
          </div>
        ) : currentExplanation ? (
          <VoiceOutput
            text={currentExplanation}
            language={state.language}
            onComplete={() => {
              if (!isLastChunk) {
                setTimeout(handleNext, 1000);
              }
            }}
          />
        ) : (
          <div className="accent-stripe card-lift rounded-lg border border-border bg-card p-5 pl-6">
            <Button
              onClick={generateExplanation}
              disabled={isGenerating}
              className="w-full transition-all duration-200 active:scale-[0.995] disabled:active:scale-100"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating…
                </>
              ) : (
                "Generate explanation"
              )}
            </Button>
          </div>
        )}
      </section>

      {hasExplanation && (
        <div className="flex justify-center">
          <Button
            onClick={handleReplay}
            variant="ghost"
            size="sm"
            className="text-primary hover:bg-primary/10 hover:text-primary active:bg-primary/15 transition-colors"
          >
            <RotateCcw className="size-4" />
            Replay
          </Button>
        </div>
      )}

      {currentQuestion && (
        <QuestionHandler
          question={currentQuestion}
          onComplete={handleQuestionComplete}
        />
      )}

      <VoiceInput onCommand={handleCommand} onQuestion={handleQuestion} />
    </div>
  );
}
