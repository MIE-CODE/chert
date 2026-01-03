"use client";

import { useRouter } from "next/navigation";
import { IconButton } from "@/app/components/ui/icon-button";
import { ArrowLeftIcon, SettingsIcon } from "@/app/components/ui/icons";
import { cn } from "@/app/lib/utils";
import { useUserStore } from "@/app/store";
import { useToast } from "@/app/components/ui/toast";

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  rightElement?: React.ReactNode;
}

const settingsSections: { title?: string; items: SettingsItem[] }[] = [
  {
    items: [
      {
        id: "profile",
        title: "Profile",
        subtitle: "Edit your profile information",
        onClick: () => {},
      },
      {
        id: "privacy",
        title: "Privacy",
        subtitle: "Blocked users, last seen, etc.",
        onClick: () => {},
      },
      {
        id: "notifications",
        title: "Notifications",
        subtitle: "Message, call, and group notifications",
        onClick: () => {},
      },
      {
        id: "wallpaper",
        title: "Chat Wallpaper",
        subtitle: "Customize your chat background",
        onClick: () => {},
      },
    ],
  },
  {
    items: [
      {
        id: "devices",
        title: "Linked Devices",
        subtitle: "Manage your connected devices",
        onClick: () => {},
      },
      {
        id: "storage",
        title: "Storage and Data",
        subtitle: "Network usage, auto-download",
        onClick: () => {},
      },
    ],
  },
  {
    items: [
      {
        id: "help",
        title: "Help",
        subtitle: "Help center, contact us, privacy policy",
        onClick: () => {},
      },
      {
        id: "about",
        title: "About",
        subtitle: "Version 1.0.0",
        onClick: () => {},
      },
      {
        id: "logout",
        title: "Log Out",
        subtitle: undefined,
        onClick: () => {},
        rightElement: undefined,
      },
    ],
  },
];

export function SettingsList() {
  const router = useRouter();
  const { logout } = useUserStore();
  const toast = useToast();

  const handleBack = () => {
    router.back();
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
    toast.success("Logged out successfully");
  };

  const handleSettingsItem = (id: string) => {
    switch (id) {
      case "profile":
        router.push("/settings/profile");
        break;
      case "logout":
        handleLogout();
        break;
      default:
        toast.info(`${id.charAt(0).toUpperCase() + id.slice(1)} feature coming soon`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-surface-elevated">
        <IconButton variant="ghost" size="md" onClick={handleBack}>
          <ArrowLeftIcon />
        </IconButton>
        <h1 className="text-xl font-bold text-primary">Settings</h1>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto">
        {settingsSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className={cn(sectionIdx > 0 && "mt-6")}>
            {section.title && (
              <div className="px-4 py-2 text-xs font-semibold text-secondary uppercase">
                {section.title}
              </div>
            )}
            <div className="bg-surface-elevated border-y border-border">
              {section.items.map((item, itemIdx) => (
                <div
                  key={item.id}
                  onClick={() => handleSettingsItem(item.id)}
                  className={cn(
                    "flex items-center justify-between p-4 cursor-pointer hover:bg-surface transition-colors touch-manipulation",
                    itemIdx < section.items.length - 1 && "border-b border-border"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <h3
                      className={cn(
                        "font-medium",
                        item.id === "logout" ? "text-error" : "text-primary"
                      )}
                    >
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-sm text-secondary mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  {item.rightElement || (
                    <svg
                      className="w-5 h-5 text-tertiary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

