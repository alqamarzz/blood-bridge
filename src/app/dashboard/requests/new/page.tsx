"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRequestSchema, CreateRequestInput } from "@/validations/request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, MapPin, AlertCircle, Clock, Heart } from "lucide-react";
import { BLOOD_GROUPS, URGENCY_LEVELS, SUPPORTED_CITIES, MEDICAL_DISCLAIMER } from "@/lib/constants";

export default function NewBloodRequestPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Default requiredBy to 24 hours from now
  const defaultRequiredBy = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      bloodGroup: "O_POS",
      unitsRequired: 1,
      hospitalName: "",
      hospitalAddress: "",
      city: "Kolkata",
      urgency: "URGENT",
      requiredBy: defaultRequiredBy,
      additionalInformation: "",
      contactPhone: "",
    },
  });

  const onSubmit = async (data: CreateRequestInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || "Failed to create blood request.");
      } else {
        router.push(`/dashboard/requests/${json.data.id}`);
      }
    } catch {
      setServerError("An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Card className="shadow-lg border-gray-200">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
            <PlusCircle className="w-4 h-4" /> Emergency Requirement
          </div>
          <CardTitle className="text-2xl font-extrabold text-gray-950">
            Create Blood Requirement
          </CardTitle>
          <CardDescription className="text-sm">
            Enter patient hospital details. Nearby compatible donors will be alerted immediately.
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

            {/* Blood Group and Units */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodGroup" className="font-semibold">
                  Required Blood Group *
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
                {errors.bloodGroup && (
                  <p className="text-xs text-red-600">{errors.bloodGroup.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitsRequired" className="font-semibold">
                  Number of Units (Bags) *
                </Label>
                <Input
                  id="unitsRequired"
                  type="number"
                  min={1}
                  max={20}
                  {...register("unitsRequired", { valueAsNumber: true })}
                />
                {errors.unitsRequired && (
                  <p className="text-xs text-red-600">{errors.unitsRequired.message}</p>
                )}
              </div>
            </div>

            {/* Urgency and Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="urgency" className="font-semibold">
                  Urgency Level *
                </Label>
                <select
                  id="urgency"
                  {...register("urgency")}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  {URGENCY_LEVELS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label} — {u.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredBy" className="font-semibold">
                  Required By (Date & Time) *
                </Label>
                <Input
                  id="requiredBy"
                  type="datetime-local"
                  {...register("requiredBy")}
                />
                {errors.requiredBy && (
                  <p className="text-xs text-red-600">{errors.requiredBy.message}</p>
                )}
              </div>
            </div>

            {/* Hospital Information */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" /> Hospital Details
              </h4>

              <div className="space-y-1.5">
                <Label htmlFor="hospitalName">Hospital Name *</Label>
                <Input
                  id="hospitalName"
                  placeholder="e.g. SSKM Hospital / Apollo Multispeciality"
                  {...register("hospitalName")}
                />
                {errors.hospitalName && (
                  <p className="text-xs text-red-600">{errors.hospitalName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="hospitalAddress">Hospital Address / Ward / Bed *</Label>
                  <Input
                    id="hospitalAddress"
                    placeholder="e.g. 244 AJC Bose Road, Main ICU Block"
                    {...register("hospitalAddress")}
                  />
                  {errors.hospitalAddress && (
                    <p className="text-xs text-red-600">{errors.hospitalAddress.message}</p>
                  )}
                </div>

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
              </div>
            </div>

            {/* Additional info and contact */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="contactPhone">Direct Attendant Phone (Optional)</Label>
                <Input
                  id="contactPhone"
                  placeholder="+919876543210"
                  {...register("contactPhone")}
                />
                <p className="text-[11px] text-gray-500">
                  Phone is only revealed to donors once you accept their offer.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="additionalInformation">Special Instructions / Patient Details</Label>
                <Textarea
                  id="additionalInformation"
                  placeholder="Provide any specific medical instructions or hospital blood bank desk details..."
                  {...register("additionalInformation")}
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Medical Notice: </span>
              {MEDICAL_DISCLAIMER}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 shadow-sm"
              isLoading={isLoading}
            >
              Publish Request & Alert Donors
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
