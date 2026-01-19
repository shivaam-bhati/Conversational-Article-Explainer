"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";
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
  const [answer, setAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const explainMutation = useMutation({
    mutationFn: async (input: {
      chunk: string;
      chunkIndex: number;
      previousExplanations?: string[];
      language: string;
      userQuestion?: string;
    }) => trpcClient.explanation.explainChunk.mutate(input),
  });

  const handleQuestion = async () => {
    if (!state) return;
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
      toast.error("Couldn’t answer. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (question && !answer && !isGenerating) {
      handleQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  if (!state) return null;

  if (isGenerating) {
    return (
      <div className="accent-stripe flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-4 pl-5">
        <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Thinking…</span>
      </div>
    );
  }

  if (!answer) return null;

  return (
    <div className="accent-stripe card-lift rounded-lg border border-primary/25 bg-primary/10 overflow-hidden">
      <div className="border-b border-primary/15 px-4 py-3">
        <div className="flex items-start gap-2">
          <MessageCircle className="size-4 shrink-0 mt-0.5 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your question</p>
            <p className="text-sm font-medium text-foreground mt-0.5">{question}</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <VoiceOutput text={answer} language={state.language} onComplete={onComplete} />
      </div>
    </div>
  );
}
