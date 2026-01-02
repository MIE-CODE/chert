"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { IconButton } from "@/app/components/ui/icon-button";
import {
  EmojiIcon,
  AttachmentIcon,
  MicIcon,
  SendIcon,
} from "@/app/components/ui/icons";
import { FiMicOff } from "react-icons/fi";
import { useRecording } from "@/app/hooks";

interface MessageInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    isRecording,
    isContinuousRecording,
    handleRecordStart,
    handleRecordEnd,
  } = useRecording();

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  };


  return (
    <div className="border-t border-border bg-surface-elevated p-4">
      <div className="flex items-end gap-2">
        <IconButton variant="ghost" size="md" title="Attach file">
          <AttachmentIcon />
        </IconButton>

        <div className="flex flex-1 relative items-center justify-center rounded-2xl border border-border bg-surface pr-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full px-4 py-2.5 pr-12  text-primary placeholder:text-tertiary focus:outline-none resize-none  transition-all max-h-[120px] overflow-y-auto"
          />
          <IconButton
            variant="ghost"
            size="sm"
            title="Emoji"
          >
            <EmojiIcon />
          </IconButton>
        </div>

        {message.trim() ? (
          <IconButton
            variant="primary"
            size="md"
            onClick={handleSend}
            title="Send"
          >
            <SendIcon />
          </IconButton>
        ) : (
          <IconButton
            variant={isRecording ? "danger" : "ghost"}
            size="md"
            onMouseDown={!isContinuousRecording ? handleRecordStart : undefined}
            onMouseUp={!isContinuousRecording ? handleRecordEnd : undefined}
            onMouseLeave={!isContinuousRecording ? handleRecordEnd : undefined}
            onTouchStart={!isContinuousRecording ? handleRecordStart : undefined}
            onTouchEnd={!isContinuousRecording ? handleRecordEnd : undefined}
            onClick={isContinuousRecording ? handleRecordStart : undefined}
            title={
              isContinuousRecording
                ? "Click to stop recording"
                : isRecording
                ? "Hold for 10s for continuous recording"
                : "Hold to record"
            }
          >
           {!isRecording ? <MicIcon />:
            <FiMicOff/>}
          </IconButton>
        )}
      </div>
    </div>
  );
}
