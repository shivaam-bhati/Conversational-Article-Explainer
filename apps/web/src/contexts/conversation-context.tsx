"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { LanguageCode } from "@/components/article-input";

interface ConversationState {
  chunks: string[];
  currentChunkIndex: number;
  explanations: Record<number, string>;
  questions: Array<{ chunkIndex: number; question: string; answer: string }>;
  language: LanguageCode;
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
  isSpeaking: boolean;
  isListening: boolean;
}

interface ConversationContextType {
  state: ConversationState | null;
  startConversation: (
    chunks: string[],
    language: LanguageCode,
    authorName?: string
  ) => void;
  setAuthorStyleProfile: (profile: ConversationState["authorStyleProfile"]) => void;
  setCurrentChunk: (index: number) => void;
  addExplanation: (chunkIndex: number, explanation: string) => void;
  addQuestion: (chunkIndex: number, question: string, answer: string) => void;
  setIsSpeaking: (speaking: boolean) => void;
  setIsListening: (listening: boolean) => void;
  reset: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined
);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConversationState | null>(null);

  const startConversation = (
    chunks: string[],
    language: LanguageCode,
    authorName?: string
  ) => {
    setState({
      chunks,
      currentChunkIndex: 0,
      explanations: {},
      questions: [],
      language,
      authorName,
      authorStyleProfile: undefined,
      isSpeaking: false,
      isListening: false,
    });
  };

  const setAuthorStyleProfile = (
    profile: ConversationState["authorStyleProfile"]
  ) => {
    setState((prev) =>
      prev ? { ...prev, authorStyleProfile: profile } : prev
    );
  };

  const setCurrentChunk = (index: number) => {
    setState((prev) => (prev ? { ...prev, currentChunkIndex: index } : prev));
  };

  const addExplanation = (chunkIndex: number, explanation: string) => {
    setState((prev) =>
      prev
        ? {
            ...prev,
            explanations: { ...prev.explanations, [chunkIndex]: explanation },
          }
        : prev
    );
  };

  const addQuestion = (chunkIndex: number, question: string, answer: string) => {
    setState((prev) =>
      prev
        ? {
            ...prev,
            questions: [...prev.questions, { chunkIndex, question, answer }],
          }
        : prev
    );
  };

  const setIsSpeaking = (speaking: boolean) => {
    setState((prev) => (prev ? { ...prev, isSpeaking: speaking } : prev));
  };

  const setIsListening = (listening: boolean) => {
    setState((prev) => (prev ? { ...prev, isListening: listening } : prev));
  };

  const reset = () => {
    setState(null);
  };

  return (
    <ConversationContext.Provider
      value={{
        state,
        startConversation,
        setAuthorStyleProfile,
        setCurrentChunk,
        addExplanation,
        addQuestion,
        setIsSpeaking,
        setIsListening,
        reset,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error("useConversation must be used within ConversationProvider");
  }
  return context;
}
