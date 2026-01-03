"use client";

import { useState } from "react";
import { Avatar } from "@/app/components/ui/avatar";
import { IconButton } from "@/app/components/ui/icon-button";
import { PhoneIcon, VideoIcon, MicIcon } from "@/app/components/ui/icons";
import { cn } from "@/app/lib/utils";

interface OngoingCallProps {
  callerName: string;
  callerAvatar?: string;
  isVideoCall?: boolean;
  onEnd: () => void;
}

export function OngoingCall({
  callerName,
  callerAvatar,
  isVideoCall = false,
  onEnd,
}: OngoingCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-primary/20 to-background">
      {isVideoCall ? (
        <div className="flex-1 relative">
          {/* Remote video */}
          <div className="absolute inset-0 bg-surface-elevated">
            <div className="flex items-center justify-center h-full">
              <Avatar
                src={callerAvatar}
                name={callerName}
                size="xl"
              />
            </div>
          </div>
          {/* Self view */}
          <div className="absolute top-4 right-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-primary bg-surface-elevated">
            <div className="flex items-center justify-center h-full">
              <Avatar name="You" size="md" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Avatar
              src={callerAvatar}
              name={callerName}
              size="xl"
              className="mb-6 mx-auto"
            />
            <h2 className="text-2xl font-bold text-primary mb-2">
              {callerName}
            </h2>
            <p className="text-secondary">{formatDuration(callDuration)}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="p-6 bg-surface-elevated/80 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-center gap-4">
          <IconButton
            variant={isMuted ? "danger" : "default"}
            size="lg"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute" : "Mute"}
          >
            <MicIcon className={cn(isMuted && "line-through")} />
          </IconButton>

          {!isVideoCall && (
            <IconButton
              variant={isSpeakerOn ? "primary" : "default"}
              size="lg"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              title={isSpeakerOn ? "Speaker off" : "Speaker on"}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.343 6.343L4.93 4.93A1 1 0 003.515 6.343L7.05 9.878a3 3 0 010 4.243l-3.536 3.536a1 1 0 001.414 1.414l1.414-1.414L18.364 5.636a1 1 0 00-1.414-1.414L15.536 5.636 12 9.172a3 3 0 00-4.243 0L4.93 5.636z" />
              </svg>
            </IconButton>
          )}

          {isVideoCall && (
            <IconButton
              variant="default"
              size="lg"
              onClick={() => {
                // Switch camera functionality
                console.log("Switching camera");
              }}
              title="Switch camera"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </IconButton>
          )}

          <IconButton
            variant="danger"
            size="lg"
            onClick={onEnd}
            title="End call"
            className="rounded-full"
          >
            <PhoneIcon className="w-6 h-6 rotate-[135deg]" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

