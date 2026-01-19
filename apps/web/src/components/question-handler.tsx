"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useConversation } from "@/contexts/conversation-context";
import { trpcClient } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { VoiceOutput } from "./voice-output";

interface QuestionHandlerProps {
  question: string;
  onComplete: () => void;
}

export function QuestionHandler({ question, onComplete }: QuestionHandlerProps) {
  const { state, addQuestion } = useConversation();
  const [answer, setAnswer] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const explainMutation = useMutation({
    mutationFn: async (input: {
      chunk: string;
      chunkIndex: number;
      previousExplanations?: string[];
      language: string;
      userQuestion?: string;
    }) => {
      return await trpcClient.explanation.explainChunk.mutate(input);
    },
  });

  if (!state) {
    return null;
  }

  const handleQuestion = async () => {
    setIsGenerating(true);
    try {
      const currentChunk = state.chunks[state.currentChunkIndex];
      const previousExplanations = Object.keys(state.explanations)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => state.explanations[Number(key)]);

      const result = await explainMutation.mutateAsync({
        chunk: currentChunk,
        chunkIndex: state.currentChunkIndex,
        previousExplanations,
        language: state.language,
        userQuestion: question,
      });

      setAnswer(result.explanation);
      addQuestion(state.currentChunkIndex, question, result.explanation);
    } catch (error) {
      console.error("Failed to answer question:", error);
      alert("Failed to answer question. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-answer when question is provided
  useEffect(() => {
    if (question && !answer && !isGenerating) {
      handleQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  if (isGenerating) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Thinking about your question...</span>
        </div>
      </Card>
    );
  }

  if (!answer) {
    return null;
  }

  return (
    <Card className="p-4 space-y-3 border-primary/20">
      <div>
        <p className="text-xs text-muted-foreground mb-1">Your question:</p>
        <p className="text-sm font-medium">{question}</p>
      </div>
      <VoiceOutput
        text={answer}
        language={state.language}
        onComplete={onComplete}
      />
    </Card>
  );
}
