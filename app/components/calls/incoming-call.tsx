"use client";

import { Avatar } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { PhoneIcon, VideoIcon } from "@/app/components/ui/icons";

interface IncomingCallProps {
  callerName: string;
  callerAvatar?: string;
  isVideoCall?: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function IncomingCall({
  callerName,
  callerAvatar,
  isVideoCall = false,
  onAccept,
  onDecline,
}: IncomingCallProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center p-8">
        <Avatar
          src={callerAvatar}
          name={callerName}
          size="xl"
          className="mb-6 mx-auto"
        />
        <h2 className="text-2xl font-bold text-inverse mb-2">
          {callerName}
        </h2>
        <p className="text-secondary mb-8">
          {isVideoCall ? "Incoming video call" : "Incoming voice call"}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="danger"
            size="lg"
            onClick={onDecline}
            className="rounded-full w-16 h-16 p-0"
          >
            <PhoneIcon className="w-6 h-6 rotate-[135deg]" />
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={onAccept}
            className="rounded-full w-16 h-16 p-0"
          >
            {isVideoCall ? (
              <VideoIcon className="w-6 h-6" />
            ) : (
              <PhoneIcon className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

