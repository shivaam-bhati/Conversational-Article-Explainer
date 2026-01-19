"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      setError("Your browser doesn't support speech recognition");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      handleVoiceInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
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
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [state?.language, setGlobalListening]);

  const handleVoiceInput = (text: string) => {
    const lowerText = text.toLowerCase().trim();

    // Simple command detection
    if (
      lowerText.includes("continue") ||
      lowerText.includes("next") ||
      lowerText.includes("go on")
    ) {
      onCommand?.("continue");
    } else if (
      lowerText.includes("repeat") ||
      lowerText.includes("say that again") ||
      lowerText.includes("replay")
    ) {
      onCommand?.("repeat");
    } else if (
      lowerText.includes("previous") ||
      lowerText.includes("go back")
    ) {
      onCommand?.("previous");
    } else if (lowerText.includes("stop")) {
      onCommand?.("stop");
    } else if (text.endsWith("?") || lowerText.startsWith("what") || lowerText.startsWith("how") || lowerText.startsWith("why") || lowerText.startsWith("can you")) {
      // It's a question
      onQuestion?.(text);
    } else {
      // Default: treat as continue
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

  if (error && !("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        {isListening ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Listening...</span>
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Voice Input</span>
          </>
        )}
      </div>

      <div className="flex gap-2">
        {!isListening ? (
          <Button onClick={startListening} size="sm" variant="default" className="w-full">
            <Mic className="h-4 w-4 mr-2" />
            Start Listening
          </Button>
        ) : (
          <Button onClick={stopListening} size="sm" variant="outline" className="w-full">
            <MicOff className="h-4 w-4 mr-2" />
            Stop Listening
          </Button>
        )}
      </div>

      {transcript && (
        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
          Heard: "{transcript}"
        </div>
      )}

      {error && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Try saying: "continue", "repeat", "what does that mean?", or ask a question
      </p>
    </Card>
  );
}
