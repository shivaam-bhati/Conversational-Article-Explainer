"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VoiceOutput } from "./voice-output";
import { VoiceInput } from "./voice-input";
import { QuestionHandler } from "./question-handler";
import { useConversation } from "@/contexts/conversation-context";
import { trpcClient } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { Loader2, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";
import { useAuthorStyle } from "@/hooks/use-author-style";

export function ExplanationView() {
  const { state, setCurrentChunk, addExplanation, setAuthorStyleProfile } =
    useConversation();
  const [currentExplanation, setCurrentExplanation] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);

  // Fetch author style if author name is provided
  const { profile: authorStyleProfile, isLoading: isLoadingAuthorStyle } =
    useAuthorStyle(state?.authorName);

  // Store author style profile in context when fetched
  // Only update if profile actually changed to avoid infinite loops
  useEffect(() => {
    if (
      authorStyleProfile &&
      state?.authorName &&
      state.authorName === authorStyleProfile.name
    ) {
      // Only update if the profile is different from what's already stored
      const currentProfile = state.authorStyleProfile;
      if (
        !currentProfile ||
        currentProfile.name !== authorStyleProfile.name ||
        JSON.stringify(currentProfile) !== JSON.stringify(authorStyleProfile)
      ) {
        console.log("Setting author style profile:", authorStyleProfile.name);
        setAuthorStyleProfile(authorStyleProfile);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorStyleProfile?.name, state?.authorName]); // Only depend on profile name and author name

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

  if (!state) {
    return null;
  }

  const currentChunk = state.chunks[state.currentChunkIndex];
  const hasExplanation = state.explanations[state.currentChunkIndex] !== undefined;

  const generateExplanation = async () => {
    if (!currentChunk) return;

    setIsGenerating(true);
    try {
      const previousExplanations = Object.keys(state.explanations)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => state.explanations[Number(key)]);

      // Use the profile from state (which should be set by the useEffect) or fallback to the hook's profile
      const profileToUse = state.authorStyleProfile || authorStyleProfile;
      
      console.log("Generating explanation with:", {
        authorName: state.authorName,
        hasProfile: !!profileToUse,
        profileName: profileToUse?.name,
      });

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
      alert("Failed to generate explanation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate explanation when chunk changes
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
        // Stop speaking is handled by VoiceOutput
        break;
    }
  };

  const handleQuestion = (question: string) => {
    setCurrentQuestion(question);
  };

  const handleQuestionComplete = () => {
    setCurrentQuestion(null);
  };

  const isFirstChunk = state.currentChunkIndex === 0;
  const isLastChunk = state.currentChunkIndex === state.chunks.length - 1;

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              Chunk {state.currentChunkIndex + 1} of {state.chunks.length}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">
                Language: {state.language}
              </p>
              {state.authorName && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs font-medium text-primary">
                    Explaining as: {state.authorName}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePrevious}
              disabled={isFirstChunk}
              size="sm"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLastChunk}
              size="sm"
              variant="outline"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
        <div className="mt-2 w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{
              width: `${((state.currentChunkIndex + 1) / state.chunks.length) * 100}%`,
            }}
          />
        </div>
      </Card>

      {/* Current chunk preview */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-2">Current Chunk:</h3>
        <p className="text-sm text-muted-foreground">{currentChunk}</p>
      </Card>

      {/* Author Style Loading */}
      {isLoadingAuthorStyle && state.authorName && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-primary">
              Learning {state.authorName}'s speaking style...
            </span>
          </div>
        </Card>
      )}

      {/* Explanation */}
      {isGenerating ? (
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              {state.authorName
                ? `Generating explanation in ${state.authorName}'s style...`
                : "Generating explanation..."}
            </span>
          </div>
        </Card>
      ) : currentExplanation ? (
        <VoiceOutput
          text={currentExplanation}
          language={state.language}
          onComplete={() => {
            // Auto-advance to next chunk after explanation completes
            if (!isLastChunk) {
              setTimeout(() => {
                handleNext();
              }, 1000);
            }
          }}
        />
      ) : (
        <Card className="p-6">
          <Button onClick={generateExplanation} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Explanation"
            )}
          </Button>
        </Card>
      )}

      {/* Replay button */}
      {hasExplanation && (
        <div className="flex justify-center">
          <Button onClick={handleReplay} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Replay Explanation
          </Button>
        </div>
      )}

      {/* Question Handler */}
      {currentQuestion && (
        <QuestionHandler question={currentQuestion} onComplete={handleQuestionComplete} />
      )}

      {/* Voice Input */}
      <VoiceInput onCommand={handleCommand} onQuestion={handleQuestion} />
    </div>
  );
}
