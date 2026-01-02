"use client";

import { useState } from "react";
import { Avatar } from "@/app/components/ui/avatar";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { PlusIcon } from "@/app/components/ui/icons";

export default function ProfileSetupPage() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");

  const handleAvatarClick = () => {
    // In a real app, this would open file picker
    setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + Math.random());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light to-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Set up your profile</h1>
          <p className="text-secondary">Add a photo and tell us about yourself</p>
        </div>

        <div className="bg-surface-elevated rounded-2xl shadow-xl p-8 border border-border">
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar
                  src={avatar || undefined}
                  name={name || "User"}
                  size="xl"
                  onClick={handleAvatarClick}
                />
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-inverse flex items-center justify-center hover:bg-primary-hover transition-colors shadow-md"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-secondary mt-2">Tap to change photo</p>
            </div>

            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />

            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              helperText="This will be your unique identifier"
            />

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Status
              </label>
              <textarea
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="Tell us about yourself (optional)"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-elevated text-primary placeholder:text-tertiary focus:outline-none transition-all duration-200 resize-none"
                rows={3}
                maxLength={100}
              />
              <p className="text-xs text-tertiary mt-1 text-right">
                {status.length}/100
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-6"
              disabled={!name || !username}
            >
              Complete Setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

