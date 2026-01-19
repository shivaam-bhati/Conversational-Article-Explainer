"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpcClient } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { Globe, User } from "lucide-react";

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
    if (inputMode === "text" && !text.trim()) {
      return;
    }
    if (inputMode === "url" && !url.trim()) {
      return;
    }

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
      alert("Failed to parse article. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const selectedLanguageName =
    LANGUAGES.find((lang) => lang.code === selectedLanguage)?.name || "English";

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Article Input</h2>
        <p className="text-sm text-muted-foreground">
          Paste your article text or provide a URL to get started
        </p>
      </div>

      {/* Language Selector */}
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Language:</span>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            {selectedLanguageName}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
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

      {/* Author Name Input (Optional) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm text-muted-foreground">
            Author/Mentor (Optional):
          </label>
        </div>
        <Input
          type="text"
          placeholder="e.g., Elon Musk, Tim Ferriss, Naval Ravikant"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Enter an author name to get explanations in their unique speaking style
        </p>
      </div>

      {/* Input Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={inputMode === "text" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputMode("text")}
        >
          Paste Article
        </Button>
        <Button
          variant={inputMode === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputMode("url")}
        >
          From URL
        </Button>
      </div>

      {/* Input Fields */}
      {inputMode === "text" ? (
        <Textarea
          placeholder="Paste your article text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[200px]"
        />
      ) : (
        <Input
          type="url"
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      )}

      {/* Parse Button */}
      <Button
        onClick={handleParse}
        disabled={isParsing || (inputMode === "text" ? !text.trim() : !url.trim())}
        className="w-full"
      >
        {isParsing ? "Parsing..." : "Start Explaining"}
      </Button>
    </Card>
  );
}
