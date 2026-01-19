import { useEffect, useState } from "react";
import { trpcClient } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";

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

export function useAuthorStyle(authorName?: string) {
  const [profile, setProfile] = useState<AuthorStyleProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStyleMutation = useMutation({
    mutationFn: async (name: string) => {
      return await trpcClient.author.getAuthorStyle.mutate({
        authorName: name,
        useLLMKnowledge: true, // For MVP, use LLM knowledge
      });
    },
  });

  useEffect(() => {
    if (!authorName || authorName.trim().length === 0) {
      setProfile(null);
      setError(null);
      return;
    }

    // Check if we already have this profile cached
    const cachedProfile = sessionStorage.getItem(`author-style-${authorName}`);
    if (cachedProfile) {
      try {
        setProfile(JSON.parse(cachedProfile));
        return;
      } catch {
        // Invalid cache, continue to fetch
      }
    }

    setIsLoading(true);
    setError(null);

    fetchStyleMutation.mutate(authorName, {
      onSuccess: (data) => {
        setProfile(data.profile);
        // Cache the profile
        sessionStorage.setItem(
          `author-style-${authorName}`,
          JSON.stringify(data.profile)
        );
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
