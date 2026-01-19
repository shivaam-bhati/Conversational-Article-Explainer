"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useConversation } from "@/contexts/conversation-context";

interface VoiceInputProps {
  onCommand?: (command: string) => void;
  onQuestion?: (question: string) => void;
}

export function VoiceInput({ onCommand, onQuestion }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { setIsListening: setGlobalListening, state } = useConversation();

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      (window as Window & { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition
      || (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = state?.language === "en" ? "en-US" : state?.language || "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setGlobalListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const t = event.results[0][0].transcript;
      setTranscript(t);
      handleVoiceInput(t);
    };

    recognition.onerror = (event: { error: string }) => {
      setError(`Error: ${event.error}`);
      setIsListening(false);
      setGlobalListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setGlobalListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, [state?.language, setGlobalListening]);

  const handleVoiceInput = (text: string) => {
    const lower = text.toLowerCase().trim();

    if (lower.includes("continue") || lower.includes("next") || lower.includes("go on")) {
      onCommand?.("continue");
    } else if (lower.includes("repeat") || lower.includes("say that again") || lower.includes("replay")) {
      onCommand?.("repeat");
    } else if (lower.includes("previous") || lower.includes("go back")) {
      onCommand?.("previous");
    } else if (lower.includes("stop")) {
      onCommand?.("stop");
    } else if (
      text.endsWith("?") ||
      lower.startsWith("what") ||
      lower.startsWith("how") ||
      lower.startsWith("why") ||
      lower.startsWith("can you")
    ) {
      onQuestion?.(text);
    } else {
      onCommand?.("continue");
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const notSupported =
    !!error &&
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window);

  if (notSupported) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <section
      aria-label="Voice commands"
      className="accent-stripe card-lift rounded-lg border border-border bg-card p-4 pl-5 space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isListening ? (
            <span className="flex items-center justify-center animate-listen-pulse" aria-hidden>
              <Loader2 className="size-4 animate-spin text-primary" />
            </span>
          ) : (
            <Mic className="size-4 text-muted-foreground" aria-hidden />
          )}
          <span className="text-sm font-medium">
            {isListening ? "Listening…" : "Voice"}
          </span>
        </div>
        {!isListening ? (
          <Button onClick={startListening} size="sm" className="transition-colors">
            <Mic className="size-4" />
            Start
          </Button>
        ) : (
          <Button
            onClick={stopListening}
            size="sm"
            variant="outline"
            className="border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
          >
            <MicOff className="size-4" />
            Stop
          </Button>
        )}
      </div>

      {transcript && (
        <p className="text-sm text-muted-foreground rounded-lg bg-muted/60 px-3 py-2">
          &ldquo;{transcript}&rdquo;
        </p>
      )}

      {error && !isListening && (
        <p className="text-xs text-destructive rounded-lg bg-destructive/10 px-3 py-2">
          {error}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Say &ldquo;next&rdquo;, &ldquo;repeat&rdquo;, &ldquo;go back&rdquo;, or ask a question.
      </p>
    </section>
  );
}
