"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donorProfileSchema, DonorProfileInput } from "@/validations/donor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MapPin, MessageCircle, AlertCircle, CheckCircle } from "lucide-react";
import { BLOOD_GROUPS, SEARCH_RADII, SUPPORTED_CITIES, MEDICAL_DISCLAIMER } from "@/lib/constants";

export default function DonorOnboardingPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DonorProfileInput>({
    resolver: zodResolver(donorProfileSchema),
    defaultValues: {
      bloodGroup: "O_POS",
      city: "Kolkata",
      preferredRadius: 5,
      isAvailable: true,
      whatsappOptIn: true,
      pushOptIn: false,
      locationConsent: true,
      lastDonationDate: "",
    },
  });

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation is not supported by your browser. You can select your city manually.");
      return;
    }
    setGeoStatus("Acquiring GPS location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", pos.coords.latitude);
        setValue("longitude", pos.coords.longitude);
        setValue("locationConsent", true);
        setGeoStatus("✓ Location acquired securely. Exact coordinates remain private.");
      },
      (err) => {
        console.warn("Geolocation denied:", err);
        setGeoStatus("Location access denied. Matching will use your city and area fallback.");
        setValue("locationConsent", false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    requestGeolocation();
  }, []);

  const onSubmit = async (data: DonorProfileInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/donors/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || "Failed to save donor profile.");
      } else {
        setSuccess("Donor profile activated! Redirecting to donor dashboard...");
        setTimeout(() => {
          router.push("/dashboard/donor");
        }, 1200);
      }
    } catch {
      setServerError("An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card className="shadow-lg border-gray-200">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mx-auto">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-gray-950">
            Donor Profile Setup
          </CardTitle>
          <CardDescription className="text-sm">
            Set your blood group, emergency radius, and communication preferences
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {serverError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                {success}
              </div>
            )}

            {/* Blood Group Selection */}
            <div className="space-y-2">
              <Label htmlFor="bloodGroup" className="font-semibold">
                Your Blood Group *
              </Label>
              <select
                id="bloodGroup"
                {...register("bloodGroup")}
                className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg.value} value={bg.value}>
                    {bg.label} ({bg.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Location & Radius */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200/80">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" /> Geospatial Matching Location
                </span>
                <button
                  type="button"
                  onClick={requestGeolocation}
                  className="text-xs text-red-600 hover:underline font-medium"
                >
                  Refresh GPS
                </button>
              </div>

              {geoStatus && (
                <p className="text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200">
                  {geoStatus}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <select
                    id="city"
                    {...register("city")}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    {SUPPORTED_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="area">Locality / Area (Fallback)</Label>
                  <Input
                    id="area"
                    placeholder="e.g. Park Circus, Salt Lake Sec 5"
                    {...register("area")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="preferredRadius">Preferred Notification Radius</Label>
                <select
                  id="preferredRadius"
                  {...register("preferredRadius", { valueAsNumber: true })}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  {SEARCH_RADII.map((r) => (
                    <option key={r.value} value={r.value}>
                      Within {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Last Donation Date */}
            <div className="space-y-1.5">
              <Label htmlFor="lastDonationDate">Last Blood Donation Date (if known)</Label>
              <Input
                id="lastDonationDate"
                type="date"
                {...register("lastDonationDate")}
              />
              <p className="text-[11px] text-gray-500">
                Indian medical guidelines recommend minimum 90 days between donations.
              </p>
            </div>

            {/* Notification & Communication Consents */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-gray-900">Communication Preferences</h4>

              <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  {...register("whatsappOptIn")}
                />
                <div className="text-xs">
                  <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Receive Urgent WhatsApp Alerts (Meta Cloud API)
                  </span>
                  <p className="text-gray-500 mt-0.5">
                    Receive immediate WhatsApp notifications when someone near you requests matching blood.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  {...register("isAvailable")}
                />
                <div className="text-xs">
                  <span className="font-semibold text-gray-900">
                    Currently Available for Emergency Donation
                  </span>
                  <p className="text-gray-500 mt-0.5">
                    You can toggle your availability at any time from your donor dashboard.
                  </p>
                </div>
              </label>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <span className="font-bold">Notice: </span>
              {MEDICAL_DISCLAIMER}
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" isLoading={isLoading}>
              Save Donor Profile
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
