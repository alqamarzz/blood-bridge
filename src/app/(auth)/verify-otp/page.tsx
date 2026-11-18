"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get("phone") || "";
  const devOtp = searchParams.get("devOtp") || "";

  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState(devOtp);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !otp) {
      setError("Please enter both phone number and 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Verification failed. Check the OTP and try again.");
      } else {
        setSuccess("Phone number verified successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone) {
      setError("Phone number is required to resend OTP.");
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to resend OTP.");
      } else {
        setSuccess("A new OTP has been generated!");
        if (json.devOtp) {
          setOtp(json.devOtp);
        }
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-gray-200">
      <CardHeader className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-extrabold text-gray-950">Verify Phone Number</CardTitle>
        <CardDescription className="text-sm">
          Enter the 6-digit verification code sent to your phone
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleVerify}>
        <CardContent className="space-y-4">
          {devOtp && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              <span className="font-bold">Development Mode OTP: </span>
              <span className="font-mono text-sm font-extrabold">{devOtp}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
              {success}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="otp">6-Digit OTP</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="text-center tracking-widest text-lg font-mono"
              disabled={isLoading}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" isLoading={isLoading}>
            Verify & Continue
          </Button>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-xs text-gray-600 hover:text-red-600 flex items-center justify-center gap-1.5 py-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
            Resend OTP code
          </button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-gray-500 text-sm">Loading verification...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </div>
  );
}
