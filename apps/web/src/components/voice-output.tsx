"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, Pause, Square, Volume2, Settings2 } from "lucide-react";
import { useConversation } from "@/contexts/conversation-context";
import type { LanguageCode } from "@/components/article-input";

// Language code mapping for Web Speech API
const TTS_LANGUAGE_MAP: Record<LanguageCode, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  hi: "hi-IN",
  zh: "zh-CN",
  ja: "ja-JP",
};

interface VoiceOutputProps {
  text: string;
  language: LanguageCode;
  onComplete?: () => void;
}

// Helper function to find the best voice for a language
function getBestVoice(langCode: string): SpeechSynthesisVoice | null {
  if (!("speechSynthesis" in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    return null;
  }

  // Filter voices that match the language
  const matchingVoices = voices.filter((voice) => {
    return voice.lang.startsWith(langCode.split("-")[0]);
  });

  if (matchingVoices.length === 0) {
    // Fallback to any voice with the exact language code
    const exactMatch = voices.find((voice) => voice.lang === langCode);
    if (exactMatch) return exactMatch;
    return voices[0]; // Ultimate fallback
  }

  // Prefer voices with local variants (e.g., en-US over en-GB for US English)
  const localVoice = matchingVoices.find((voice) => voice.lang === langCode);
  if (localVoice) return localVoice;

  // Prefer female voices (often sound more natural for narration)
  const femaleVoice = matchingVoices.find((voice) => {
    const name = voice.name.toLowerCase();
    return name.includes("female") || name.includes("zira") || name.includes("samantha") || 
           name.includes("karen") || name.includes("susan") || name.includes("fiona");
  });

  if (femaleVoice) return femaleVoice;

  // Prefer premium/high-quality voices (often have names like "premium", "enhanced", "neural")
  const premiumVoice = matchingVoices.find((voice) => {
    const name = voice.name.toLowerCase();
    return name.includes("premium") || name.includes("enhanced") || 
           name.includes("neural") || name.includes("natural");
  });

  if (premiumVoice) return premiumVoice;

  // Return the first matching voice
  return matchingVoices[0];
}

export function VoiceOutput({ text, language, onComplete }: VoiceOutputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { setIsSpeaking: setGlobalSpeaking } = useConversation();

  // Load and filter voices for the selected language
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const ttsLanguage = TTS_LANGUAGE_MAP[language] || "en-US";
      
      // Filter voices matching the language
      const matchingVoices = allVoices.filter((voice) => {
        return voice.lang.startsWith(ttsLanguage.split("-")[0]) || voice.lang === ttsLanguage;
      });

      const voicesToShow = matchingVoices.length > 0 ? matchingVoices : allVoices;
      setVoices(voicesToShow);

      // Set default voice if not already selected or if language changed
      if (!selectedVoice || !voicesToShow.includes(selectedVoice)) {
        const bestVoice = getBestVoice(ttsLanguage);
        if (bestVoice && voicesToShow.includes(bestVoice)) {
          setSelectedVoice(bestVoice);
        } else if (voicesToShow.length > 0) {
          setSelectedVoice(voicesToShow[0]);
        } else if (allVoices.length > 0) {
          setSelectedVoice(allVoices[0]);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const speak = () => {
    if (!("speechSynthesis" in window)) {
      alert("Your browser doesn't support text-to-speech");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const ttsLanguage = TTS_LANGUAGE_MAP[language] || "en-US";
    utterance.lang = ttsLanguage;
    
    // Use selected voice or find best available
    const voiceToUse = selectedVoice || getBestVoice(ttsLanguage);
    if (voiceToUse) {
      utterance.voice = voiceToUse;
      console.log(`Using voice: ${voiceToUse.name} (${voiceToUse.lang})`);
    }

    // Natural narration settings - more like a real author reading
    utterance.rate = 1.0; // Natural speed (slightly faster than before)
    utterance.pitch = 0.95; // Slightly lower pitch for more mature/natural sound
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setGlobalSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setGlobalSpeaking(false);
      onComplete?.();
    };

    utterance.onerror = (error) => {
      // Extract error details (SpeechSynthesisErrorEvent may not log well)
      const errorInfo = {
        error: error.error,
        type: error.type,
        charIndex: error.charIndex,
        language: utterance.lang,
        textPreview: text.substring(0, 50),
      };

      console.error("Speech synthesis error:", errorInfo);
      
      // Common SpeechSynthesisError types:
      // - 'not-allowed': User interaction required (browser autoplay policy)
      // - 'network': Network error
      // - 'synthesis-failed': Voice synthesis failed
      // - 'synthesis-unavailable': No voices available
      // - 'text-too-long': Text is too long
      // - 'invalid-argument': Invalid language or other argument
      // - 'language-unavailable': Language not supported
      
      if (error.error === "not-allowed") {
        console.warn(
          "Speech synthesis requires user interaction. " +
          "Browser blocked autoplay - ensure speech is triggered by a user action."
        );
      } else if (error.error === "language-unavailable") {
        console.warn(`Language ${utterance.lang} not available on this system.`);
      } else if (error.error === "synthesis-unavailable") {
        console.warn("No voices available for speech synthesis on this browser/system.");
      }
      
      setIsSpeaking(false);
      setIsPaused(false);
      setGlobalSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setGlobalSpeaking(false);
  };

  // Cancel any ongoing speech when component unmounts or text changes
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text]);

  if (!text) {
    return null;
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Voice Output</span>
          {isSpeaking && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Speaking...
            </span>
          )}
        </div>
        {voices.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
              <Settings2 className="h-3 w-3 mr-1" />
              Voice
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
              {voices.map((voice) => (
                <DropdownMenuItem
                  key={voice.name}
                  onClick={() => setSelectedVoice(voice)}
                  className={selectedVoice?.name === voice.name ? "bg-accent" : ""}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{voice.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {voice.lang} {voice.localService ? "(Local)" : ""}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex gap-2">
        {!isSpeaking && !isPaused && (
          <Button onClick={speak} size="sm" variant="default">
            <Play className="h-4 w-4 mr-2" />
            Play
          </Button>
        )}
        {isSpeaking && !isPaused && (
          <Button onClick={pause} size="sm" variant="outline">
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </Button>
        )}
        {isPaused && (
          <Button onClick={resume} size="sm" variant="default">
            <Play className="h-4 w-4 mr-2" />
            Resume
          </Button>
        )}
        {(isSpeaking || isPaused) && (
          <Button onClick={stop} size="sm" variant="outline">
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        )}
      </div>

      {/* Optional: Show explanation text */}
      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
        {text}
      </div>
    </Card>
  );
}
