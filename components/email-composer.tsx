"use client";

import { useState } from "react";
import { MinimalTiptap } from "@/components/ui/shadcn-io/minimal-tiptap";
import { Button } from "@/components/ui/button";
import { RiGeminiLine } from "react-icons/ri";

interface EmailComposerProps {
  content: string;
  onChange: (content: string) => void;
  onRewrite?: () => void | Promise<void>;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  disabled?: boolean;
  enableAIRewrite?: boolean;
}

export function EmailComposer({
  content,
  onChange,
  onRewrite,
  placeholder = "Start typing your email...",
  minHeight = "200px",
  className = "",
  disabled = false,
  enableAIRewrite = true,
}: EmailComposerProps) {
  const [isRewriting, setIsRewriting] = useState(false);

  const handleAIRewrite = async () => {
    if (!onRewrite) {
      // Use default API rewrite if no custom handler provided
      setIsRewriting(true);
      try {
        const response = await fetch("/api/rewrite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: content }),
        });

        if (!response.ok) {
          throw new Error("Failed to rewrite email");
        }

        const data = await response.json();
        onChange(data.rewrittenText);
      } catch (error) {
        console.error("Error rewriting email:", error);
        alert("Failed to rewrite email. Please try again.");
      } finally {
        setIsRewriting(false);
      }
    } else {
      // Use custom handler if provided
      setIsRewriting(true);
      try {
        await onRewrite();
      } finally {
        setIsRewriting(false);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <MinimalTiptap
        content={content}
        onChange={onChange}
        placeholder={placeholder}
        className={`${minHeight ? `min-h-[${minHeight}]` : ""}`}
      />
      
      {/* AI Rewrite Button */}
      {enableAIRewrite && !disabled && (
        <div className="absolute bottom-3 right-3 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIRewrite}
            disabled={!content.trim() || isRewriting}
            className="flex items-center gap-2 shadow-lg bg-background/95 backdrop-blur-sm hover:bg-accent border-border/50 hover:border-border transition-all"
          >
            <RiGeminiLine className={`w-4 h-4 ${isRewriting ? "animate-spin" : ""}`} />
            <span className="text-xs font-medium">
              {isRewriting ? "Rewriting..." : "Rewrite with AI"}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
