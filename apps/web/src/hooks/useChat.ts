"use client";

import { useState, useCallback } from "react";
import { sendChatMessage, ChatMessage } from "../services/chat";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    // Add placeholder for assistant response
    const loadingMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      // Build history from previous messages (excluding loading message)
      const history: ChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await sendChatMessage({
        message: content.trim(),
        history,
      });

      if (response.success && response.data) {
        // Replace loading message with actual response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingMessage.id
              ? {
                  ...msg,
                  content: response.data!.reply,
                  isLoading: false,
                }
              : msg
          )
        );
      } else {
        // Remove loading message and set error
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== loadingMessage.id)
        );
        setError(response.error || "Failed to get response");
      }
    } catch (err) {
      // Remove loading message on error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== loadingMessage.id)
      );
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
