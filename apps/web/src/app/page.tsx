"use client";

import { ArticleInput } from "@/components/article-input";
import { ExplanationView } from "@/components/explanation-view";
import { useConversation } from "@/contexts/conversation-context";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { state, startConversation, reset } = useConversation();

  const handleArticleParsed = (
    chunks: string[],
    language: string,
    authorName?: string
  ) => {
    startConversation(chunks, language as any, authorName);
  };

  if (!state) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Conversational Article Explainer</h1>
            <p className="text-muted-foreground">
              Transform long-form articles into interactive, voice-first explanations
            </p>
          </div>
          <ArticleInput onArticleParsed={handleArticleParsed} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Article Explainer</h1>
            <p className="text-sm text-muted-foreground">
              {state.chunks.length} chunks • Language: {state.language}
              {state.authorName && ` • Explaining as: ${state.authorName}`}
            </p>
          </div>
          <Button onClick={reset} variant="outline" size="sm">
            Start New Article
          </Button>
        </div>
        <ExplanationView />
      </div>
    </div>
  );
}
