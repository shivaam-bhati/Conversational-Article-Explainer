"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, Pause, Square, Volume2, Settings2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useConversation } from "@/contexts/conversation-context";
import type { LanguageCode } from "@/components/article-input";
import { trpcClient } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";

const TTS_LANGUAGE_MAP: Record<LanguageCode, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  hi: "hi-IN",
  zh: "zh-CN",
  ja: "ja-JP",
};

type TTSMethod = "web-speech" | "gpt-sovits";

interface VoiceOutputProps {
  text: string;
  language: LanguageCode;
  onComplete?: () => void;
}

function getBestVoice(langCode: string): SpeechSynthesisVoice | null {
  if (!("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const match = voices.filter((v) => v.lang.startsWith(langCode.split("-")[0]));
  if (match.length === 0) {
    const exact = voices.find((v) => v.lang === langCode);
    return exact ?? voices[0];
  }

  const local = match.find((v) => v.lang === langCode);
  if (local) return local;

  const female = match.find((v) => {
    const n = v.name.toLowerCase();
    return n.includes("female") || n.includes("zira") || n.includes("samantha") ||
           n.includes("karen") || n.includes("susan") || n.includes("fiona");
  });
  if (female) return female;

  const premium = match.find((v) => {
    const n = v.name.toLowerCase();
    return n.includes("premium") || n.includes("enhanced") || n.includes("neural") || n.includes("natural");
  });
  if (premium) return premium;

  return match[0];
}

export function VoiceOutput({ text, language, onComplete }: VoiceOutputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [ttsMethod, setTtsMethod] = useState<TTSMethod>("web-speech");
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [showText, setShowText] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { state, setIsSpeaking: setGlobalSpeaking } = useConversation();

  const gptSoVITSMutation = useMutation({
    mutationFn: async (input: {
      text: string;
      language: string;
      authorName?: string;
    }) => trpcClient.tts.generateSpeech.mutate(input),
  });

  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const tts = TTS_LANGUAGE_MAP[language] || "en-US";
      const match = all.filter(
        (v) => v.lang.startsWith(tts.split("-")[0]) || v.lang === tts
      );
      const list = match.length > 0 ? match : all;
      setVoices(list);

      if (!selectedVoice || !list.includes(selectedVoice)) {
        const best = getBestVoice(tts);
        if (best && list.includes(best)) setSelectedVoice(best);
        else if (list.length > 0) setSelectedVoice(list[0]);
        else if (all.length > 0) setSelectedVoice(all[0]);
      }
    };

    load();
    window.speechSynthesis.onvoiceschanged = load;

    return () => {
      if (utteranceRef.current) window.speechSynthesis.cancel();
    };
  }, [language]);

  useEffect(() => {
    setTtsMethod("web-speech");
  }, [state?.authorName]);

  const speakWithGPTSoVITS = async () => {
    setIsGeneratingAudio(true);
    try {
      const result = await gptSoVITSMutation.mutateAsync({
        text,
        language,
        authorName: state?.authorName,
      });

      if ("error" in result || !("audioUrl" in result) || !result.audioUrl) {
        speakWithWebSpeech();
        return;
      }

      const audio = new Audio(result.audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setGlobalSpeaking(true);
        setIsGeneratingAudio(false);
      };
      audio.onpause = () => setIsPaused(true);
      audio.onended = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setGlobalSpeaking(false);
        setIsGeneratingAudio(false);
        onComplete?.();
      };
      audio.onerror = () => {
        setIsGeneratingAudio(false);
        setIsSpeaking(false);
        setGlobalSpeaking(false);
        speakWithWebSpeech();
      };
      await audio.play();
    } catch {
      setIsGeneratingAudio(false);
      speakWithWebSpeech();
    }
  };

  const speakWithWebSpeech = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported.");
      return;
    }

    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    const tts = TTS_LANGUAGE_MAP[language] || "en-US";
    u.lang = tts;

    const voice = selectedVoice || getBestVoice(tts);
    if (voice) u.voice = voice;

    u.rate = 1.0;
    u.pitch = 0.95;
    u.volume = 1;

    u.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setGlobalSpeaking(true);
    };
    u.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setGlobalSpeaking(false);
      onComplete?.();
    };
    u.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setGlobalSpeaking(false);
    };

    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  };

  const speak = () => {
    if (ttsMethod === "gpt-sovits") speakWithGPTSoVITS();
    else speakWithWebSpeech();
  };

  const pause = () => {
    if (ttsMethod === "gpt-sovits" && audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
    } else if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (ttsMethod === "gpt-sovits" && audioRef.current) {
      audioRef.current.play();
      setIsPaused(false);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (ttsMethod === "gpt-sovits" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    } else {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setGlobalSpeaking(false);
    setIsGeneratingAudio(false);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis.cancel();
    };
  }, [text]);

  if (!text) return null;

  return (
    <div className="accent-stripe card-lift rounded-lg border border-border bg-card overflow-hidden">
      {/* Controls bar */}
      <div className="flex items-center gap-3 p-4">
        <span
          className={`flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground ${isSpeaking && !isGeneratingAudio ? "animate-speak-glow" : ""}`}
          aria-hidden
        >
          <Volume2 className="size-4" />
        </span>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {!isSpeaking && !isPaused && (
            <Button onClick={speak} size="sm">
              <Play className="size-4" />
              Play
            </Button>
          )}
          {isSpeaking && !isPaused && (
            <Button onClick={pause} size="sm" variant="outline" className="transition-colors">
              <Pause className="size-4" />
              Pause
            </Button>
          )}
          {isPaused && (
            <Button onClick={resume} size="sm">
              <Play className="size-4" />
              Resume
            </Button>
          )}
          {(isSpeaking || isPaused) && (
            <Button
              onClick={stop}
              size="sm"
              variant="outline"
              className="border-primary/40 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-colors"
            >
              <Square className="size-4" />
              Stop
            </Button>
          )}
          {isGeneratingAudio && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Generating…
            </span>
          )}
          {isSpeaking && !isGeneratingAudio && (
            <span className="text-sm text-muted-foreground animate-pulse">Speaking…</span>
          )}
        </div>
        {voices.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon-sm" />}>
              <Settings2 className="size-4" aria-hidden />
              <span className="sr-only">Voice options</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[280px] overflow-y-auto">
              {voices.map((v) => (
                <DropdownMenuItem
                  key={v.name}
                  onClick={() => setSelectedVoice(v)}
                  className={selectedVoice?.name === v.name ? "bg-accent" : ""}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{v.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {v.lang} {v.localService ? "(Local)" : ""}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Collapsible text */}
      <div className="border-t border-border">
        <button
          type="button"
          onClick={() => setShowText((s) => !s)}
          className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary active:bg-primary/15 transition-colors rounded-b-lg"
        >
          {showText ? "Hide transcript" : "Show transcript"}
          {showText ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        {showText && (
          <div className="max-h-40 overflow-y-auto px-4 pb-4 text-sm text-foreground/90 leading-relaxed">
            {text}
          </div>
        )}
      </div>
    </div>
  );
}
