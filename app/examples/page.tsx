"use client";

import Link from "next/link";

export default function ExamplesPage() {
  const examples = [
    { name: "Login", path: "/auth/login" },
    { name: "Signup", path: "/auth/signup" },
    { name: "OTP Verification", path: "/auth/otp" },
    { name: "Profile Setup", path: "/auth/profile-setup" },
    { name: "Chat List", path: "/" },
    { name: "Chat Conversation", path: "/chat" },
    { name: "Contacts", path: "/contacts" },
    { name: "New Group", path: "/groups/new" },
    { name: "Settings", path: "/settings" },
    { name: "Profile", path: "/settings/profile" },
  ];

  return (
    <div className=" min-h-screen bg-background p-2 sm:p-8">
      <div className="flex flex-col gap-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Chert UI Examples
        </h1>
        <p className="text-secondary mb-8">
          Explore all the screens and components of the Chert chat application
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examples.map((example) => (
            <Link key={example.path} href={example.path}>
              <div className="p-2 bg-surface-elevated rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                <h3 className="font-semibold text-primary">
                  {example.name}
                </h3>
                <p className="text-sm text-secondary mt-1">
                  {example.path}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
