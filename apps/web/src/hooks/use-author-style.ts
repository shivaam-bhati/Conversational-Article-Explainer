import { useEffect, useState } from "react";
import { trpcClient } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";

const STORAGE_KEY_VERSION = "v1";

interface AuthorStyleProfile {
  name: string;
  vocabulary: string[];
  sentencePatterns: string[];
  analogies: string[];
  tone: string;
  explanationStyle: string;
  personality: string[];
  sampleQuotes: string[];
}

function getCachedProfile(authorName: string): AuthorStyleProfile | null {
  try {
    const raw = sessionStorage.getItem(`author-style-${STORAGE_KEY_VERSION}-${authorName}`);
    return raw ? (JSON.parse(raw) as AuthorStyleProfile) : null;
  } catch {
    return null;
  }
}

function setCachedProfile(authorName: string, profile: AuthorStyleProfile): void {
  try {
    sessionStorage.setItem(
      `author-style-${STORAGE_KEY_VERSION}-${authorName}`,
      JSON.stringify(profile)
    );
  } catch {
    // sessionStorage can throw in private browsing or when quota exceeded
  }
}

export function useAuthorStyle(authorName?: string) {
  const [profile, setProfile] = useState<AuthorStyleProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStyleMutation = useMutation({
    mutationFn: async (name: string) => {
      return await trpcClient.author.getAuthorStyle.mutate({
        authorName: name,
        useLLMKnowledge: true,
      });
    },
  });

  useEffect(() => {
    if (!authorName || authorName.trim().length === 0) {
      setProfile(null);
      setError(null);
      return;
    }

    const cached = getCachedProfile(authorName);
    if (cached) {
      setProfile(cached);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchStyleMutation.mutate(authorName, {
      onSuccess: (data) => {
        setProfile(data.profile);
        setCachedProfile(authorName, data.profile);
        setIsLoading(false);
      },
      onError: (err) => {
        setError(
          err instanceof Error ? err.message : "Failed to fetch author style"
        );
        setIsLoading(false);
      },
    });
  }, [authorName]);

  return {
    profile,
    isLoading,
    error,
  };
}
