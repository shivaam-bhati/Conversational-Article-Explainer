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
      <main className="flex min-h-0 flex-1 flex-col overflow-auto">
        <div className="container mx-auto max-w-2xl px-4 pt-10 pb-14 sm:pt-14 sm:pb-20">
          <div className="grid gap-10 sm:gap-14 lg:grid-cols-[1fr,minmax(380px,1fr)] lg:items-start">
            {/* Left: headline — asymmetric, not centered */}
            <div className="lg:pt-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                Turn articles into{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary">conversations</span>
                  <span
                    className="absolute bottom-1 left-0 right-0 h-3 -z-10 bg-primary/25 transition-colors duration-200"
                    aria-hidden
                  />
                </span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg max-w-md leading-relaxed">
                Paste text or a URL. Get voice-first explanations you can ask questions about—in your language, in any style.
              </p>
              <div
                className="mt-8 hidden h-2 w-24 rounded-full bg-primary/40 lg:block animate-in fade-in duration-500 fill-mode-[backwards] [animation-delay:150ms]"
                aria-hidden
              />
            </div>
            {/* Right: form */}
            <ArticleInput onArticleParsed={handleArticleParsed} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Explaining</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {state.chunks.length} sections · {state.language}
              {state.authorName && ` · as ${state.authorName}`}
            </p>
          </div>
          <Button
            onClick={reset}
            variant="outline"
            size="sm"
            className="border-primary/40 hover:bg-primary/10 hover:border-primary/50 active:bg-primary/15 transition-colors"
          >
            New article
          </Button>
        </div>
        <ExplanationView />
      </div>
    </main>
  );
}
