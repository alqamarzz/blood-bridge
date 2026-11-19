"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await signIn("credentials", {
        identifier: data.identifier,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setAuthError("Invalid email/phone number or password.");
      } else {
        router.push("/dashboard/requests");
        router.refresh();
      }
    } catch {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white mx-auto shadow-sm">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-gray-950">Welcome Back</CardTitle>
          <CardDescription className="text-sm">
            Log in to manage your blood requests or donor availability
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="identifier">Email or Phone Number</Label>
              <Input
                id="identifier"
                placeholder="admin@bloodbridge.org or +919876543210"
                {...register("identifier")}
                disabled={isLoading}
              />
              {errors.identifier && (
                <p className="text-xs text-red-600">{errors.identifier.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" isLoading={isLoading}>
              Sign In
            </Button>
            <p className="text-xs text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-red-600 font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
