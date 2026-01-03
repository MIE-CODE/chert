"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { useAuthContext } from "@/app/components/auth/auth-provider";
import { useUserStore } from "@/app/store";
import { HiChat, HiSparkles, HiLockClosed, HiLightningBolt, HiUsers, HiShieldCheck } from "react-icons/hi";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const { isInitialized, isAuthenticated } = useAuthContext();
  const { isAuthenticated: userIsAuthenticated } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if authenticated
  useEffect(() => {
    if (isInitialized && (isAuthenticated || userIsAuthenticated)) {
      router.replace("/");
    }
  }, [isInitialized, isAuthenticated, userIsAuthenticated, router]);

  // Don't render until mounted
  if (!mounted || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </div>
    );
  }

  // Don't render if authenticated (redirect in progress)
  if (isAuthenticated || userIsAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-primary-light via-background to-primary-light/30 w-full">
      {/* Navigation */}
      <nav className="container w-full mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <HiChat className="w-6 h-6 text-inverse" />
          </div>
          <span className="text-2xl font-bold text-primary">Chert</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" size="md">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="primary" size="md">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col gap-6 container w-full mx-auto px-4 py-20">
        <div className="flex flex-col gap-6 items-center text-center w-full mx-auto  mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 my-8 animate-fade-in">
            <HiSparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Welcome to the future of messaging</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-primary  animate-slide-up">
            Chat that feels
            <br />
            <span className="bg-linear-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              magical
            </span>
          </h1>
          
          <p className="text-xl text-center text-secondary mb-12 max-w-2xl mx-auto animate-slide-up-delay">
            Experience seamless communication with real-time messaging, group chats, and
            everything you need to stay connected with the people who matter most.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-slide-up-delay-2">
            <Link href="/auth/signup">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Start Chatting Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-32 w-full">
            <FeatureCard
              icon={HiLightningBolt}
              title="Lightning Fast"
              description="Real-time messaging powered by WebSocket technology for instant delivery"
              delay="0"
            />
            <FeatureCard
              icon={HiLockClosed}
              title="Secure & Private"
              description="End-to-end encryption and secure authentication to keep your conversations safe"
              delay="100"
            />
            <FeatureCard
              icon={HiUsers}
              title="Group Chats"
              description="Create groups, add members, and collaborate with teams of any size"
              delay="200"
            />
            <FeatureCard
              icon={HiShieldCheck}
              title="Reliable"
              description="Built with modern technology for 99.9% uptime and seamless experience"
              delay="0"
            />
            <FeatureCard
              icon={HiChat}
              title="Rich Messaging"
              description="Send text, images, files, and voice messages with ease"
              delay="100"
            />
            <FeatureCard
              icon={HiSparkles}
              title="Beautiful UI"
              description="Modern, clean interface designed for the best user experience"
              delay="200"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-border mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <HiChat className="w-5 h-5 text-inverse" />
            </div>
            <span className="text-lg font-semibold text-primary">Chert</span>
          </div>
          <p className="text-sm text-secondary text-center">
            © {new Date().getFullYear()} Chert. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div
      className="p-6 rounded-xl bg-surface-elevated border border-border hover:border-primary/50 transition-all hover:shadow-lg group"
      style={{
        animation: `fadeInUp 0.6s ease-out ${delay}ms both`,
      }}
    >
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      <p className="text-sm text-secondary">{description}</p>
    </div>
  );
}

