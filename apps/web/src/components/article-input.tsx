"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpcClient } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { Globe, User, FileText, Link2, Loader2 } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "hi", name: "हिन्दी" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

interface ArticleInputProps {
  onArticleParsed: (chunks: string[], language: LanguageCode, authorName?: string) => void;
}

export function ArticleInput({ onArticleParsed }: ArticleInputProps) {
  const [inputMode, setInputMode] = useState<"text" | "url">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en");
  const [authorName, setAuthorName] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  const parseMutation = useMutation({
    mutationFn: async (input: { url?: string; text?: string }) => {
      return await trpcClient.article.parseArticle.mutate(input);
    },
  });

  const handleParse = async () => {
    if (inputMode === "text" && !text.trim()) return;
    if (inputMode === "url" && !url.trim()) return;

    setIsParsing(true);
    try {
      const result = await parseMutation.mutateAsync({
        [inputMode]: inputMode === "text" ? text : url,
      });
      onArticleParsed(
        result.chunks,
        selectedLanguage,
        authorName.trim() || undefined
      );
    } catch (error) {
      console.error("Failed to parse article:", error);
      toast.error("Couldn’t parse article. Check the URL or text and try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const selectedLanguageName =
    LANGUAGES.find((l) => l.code === selectedLanguage)?.name ?? "English";
  const canSubmit = inputMode === "text" ? !!text.trim() : !!url.trim();

  return (
    <div className="accent-stripe card-lift w-full rounded-lg border border-border bg-card p-5 pl-6 sm:p-6 sm:pl-7">
      <div
        role="tablist"
        className="mb-5 flex rounded-lg bg-muted/80 p-1"
        aria-label="Input mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={inputMode === "text"}
          onClick={() => setInputMode("text")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
            inputMode === "text"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          }`}
        >
          <FileText className="size-4 shrink-0" aria-hidden />
          Paste article
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={inputMode === "url"}
          onClick={() => setInputMode("url")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
            inputMode === "url"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
          }`}
        >
          <Link2 className="size-4 shrink-0" aria-hidden />
          From URL
        </button>
      </div>

      {inputMode === "text" ? (
        <Textarea
          placeholder="Paste your article here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[160px] resize-y rounded-lg border-border bg-background/70 text-base placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Article text"
        />
      ) : (
        <Input
          type="url"
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-11 rounded-lg border-border bg-background/70 text-base placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Article URL"
        />
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-muted-foreground" aria-hidden />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-colors"
                >
                  {selectedLanguageName}
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <User className="size-4 text-muted-foreground" aria-hidden />
          <Input
            type="text"
            placeholder="Author style (optional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="h-8 w-44 rounded-md border-border text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="Explain in this person's style (optional)"
          />
        </div>
      </div>

      <Button
        onClick={handleParse}
        disabled={isParsing || !canSubmit}
        className="mt-5 h-11 w-full rounded-lg font-semibold transition-all duration-200 active:scale-[0.995] disabled:active:scale-100"
      >
        {isParsing ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Parsing…
          </>
        ) : (
          "Start explaining"
        )}
      </Button>
    </div>
  );
}
