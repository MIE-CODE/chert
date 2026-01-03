"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/app/components/ui/avatar";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { IconButton } from "@/app/components/ui/icon-button";
import { ArrowLeftIcon, PlusIcon } from "@/app/components/ui/icons";
import { useToast } from "@/app/components/ui/toast";

export function ProfileSettings() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("John Doe");
  const [username, setUsername] = useState("johndoe");
  const [bio, setBio] = useState("Hey there! I'm using Chert.");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [email, setEmail] = useState("john@example.com");

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    // In a real app, this would save to the API
    toast.success("Profile updated successfully");
    router.back();
  };

  const handleChangePhoto = () => {
    toast.info("Change photo feature coming soon");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-surface-elevated">
        <IconButton variant="ghost" size="md" onClick={handleBack}>
          <ArrowLeftIcon />
        </IconButton>
        <h1 className="text-xl font-bold text-primary">Edit Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar name={name} size="xl" />
            <button 
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-inverse flex items-center justify-center hover:bg-primary-hover transition-colors"
              onClick={handleChangePhoto}
              title="Change photo"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-secondary mt-2">Tap to change photo</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            helperText="This will be your unique identifier"
          />
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-elevated text-primary placeholder:text-tertiary focus:outline-none transition-all resize-none"
              rows={3}
              maxLength={100}
            />
            <p className="text-xs text-tertiary mt-1 text-right">
              {bio.length}/100
            </p>
          </div>
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button 
          variant="primary" 
          size="lg" 
          className="w-full"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

