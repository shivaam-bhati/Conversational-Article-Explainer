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
    if (!state) return;
    setState({ ...state, authorStyleProfile: profile });
  };

  const setCurrentChunk = (index: number) => {
    if (!state) return;
    setState({ ...state, currentChunkIndex: index });
  };

  const addExplanation = (chunkIndex: number, explanation: string) => {
    if (!state) return;
    setState({
      ...state,
      explanations: { ...state.explanations, [chunkIndex]: explanation },
    });
  };

  const addQuestion = (chunkIndex: number, question: string, answer: string) => {
    if (!state) return;
    setState({
      ...state,
      questions: [...state.questions, { chunkIndex, question, answer }],
    });
  };

  const setIsSpeaking = (speaking: boolean) => {
    if (!state) return;
    setState({ ...state, isSpeaking: speaking });
  };

  const setIsListening = (listening: boolean) => {
    if (!state) return;
    setState({ ...state, isListening: listening });
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
