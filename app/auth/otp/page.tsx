"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/app/components/ui/button";
import { ArrowLeftIcon } from "@/app/components/ui/icons";
import Link from "next/link";

export default function OTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
      if (index < 6 && /^\d$/.test(char)) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-light to-background p-4">
      <div className="w-full max-w-md">
        <Link
          href="/auth/login"
          className="inline-flex items-center text-secondary hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeftIcon className="mr-2" />
          Back to login
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Verify your phone</h1>
          <p className="text-secondary">
            We've sent a 6-digit code to <br />
            <span className="font-medium text-primary">+1 (555) 123-4567</span>
          </p>
        </div>

        <div className="bg-surface-elevated rounded-2xl shadow-xl p-8 border border-border">
          <div className="space-y-6">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-semibold rounded-lg border-2 border-border bg-surface focus:outline-none transition-colors"
                />
              ))}
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!isComplete}
            >
              Verify Code
            </Button>

            <div className="text-center">
              <p className="text-sm text-secondary mb-4">
                Didn't receive the code?
              </p>
              <button className="text-sm text-primary hover:text-primary-hover font-medium">
                Resend code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

