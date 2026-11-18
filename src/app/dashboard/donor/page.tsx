"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Sliders,
  Bell,
  RefreshCw,
} from "lucide-react";
import { formatBloodGroup, formatDateTime, getUrgencyColor } from "@/lib/utils";

interface DonorProfile {
  id: string;
  bloodGroup: string;
  city: string;
  area: string | null;
  preferredRadius: number;
  isAvailable: boolean;
  whatsappOptIn: boolean;
}

interface NearbyRequest {
  id: string;
  bloodGroup: string;
  unitsRequired: number;
  unitsFulfilled: number;
  hospitalName: string;
  hospitalAddress: string;
  city: string;
  requiredBy: string;
  urgency: string;
  status: string;
  additionalInformation: string | null;
  approximateDistance: string;
  requester: {
    id: string;
    name: string;
  };
  _count: {
    donorResponses: number;
  };
}

export default function DonorDashboardPage() {
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [requests, setRequests] = useState<NearbyRequest[]>([]);
  const [volunteeredIds, setVolunteeredIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchDonorData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Profile
      const profRes = await fetch("/api/donors/profile");
      const profJson = await profRes.json();

      if (profJson.data) {
        setProfile(profJson.data);

        // 2. Fetch requests matching donor's blood group
        const reqRes = await fetch(
          `/api/requests?bloodGroup=${profJson.data.bloodGroup}&city=${profJson.data.city}&status=OPEN`
        );
        const reqJson = await reqRes.json();
        if (reqJson.requests) {
          setRequests(
            reqJson.requests.map((r: NearbyRequest) => ({
              ...r,
              approximateDistance: "About 2-5 km away",
            }))
          );
        }
      }
    } catch (err) {
      console.error("Failed to load donor dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, []);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    setIsToggling(true);
    setActionMessage(null);

    const newStatus = !profile.isAvailable;
    try {
      const res = await fetch("/api/donors/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: newStatus }),
      });

      if (res.ok) {
        setProfile({ ...profile, isAvailable: newStatus });
        setActionMessage({
          type: "success",
          text: `Availability switched to ${newStatus ? "ACTIVE" : "UNAVAILABLE"}`,
        });
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to update availability" });
    } finally {
      setIsToggling(false);
    }
  };

  const handleVolunteer = async (requestId: string) => {
    setActionMessage(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "I am ready and available to donate." }),
      });

      const json = await res.json();

      if (!res.ok) {
        setActionMessage({ type: "error", text: json.error || "Failed to volunteer" });
      } else {
        setVolunteeredIds((prev) => [...prev, requestId]);
        setActionMessage({
          type: "success",
          text: "Offer recorded! The requester has received a WhatsApp & in-app notification.",
        });
      }
    } catch {
      setActionMessage({ type: "error", text: "Network error occurred." });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-600 mb-2" />
        <p className="text-sm">Loading your donor profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mx-auto">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h2 className="text-2xl font-bold text-gray-950">Donor Profile Incomplete</h2>
        <p className="text-sm text-gray-600">
          You haven't set up your donor parameters yet. Register your blood group and radius to
          start receiving matched requests.
        </p>
        <Link href="/dashboard/donor/onboarding">
          <Button className="bg-red-600 hover:bg-red-700">Set Up Donor Profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Feedback Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-2xl bg-red-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-sm">
            {formatBloodGroup(profile.bloodGroup)}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-950">Donor Dashboard</h1>
              <Badge variant={profile.isAvailable ? "success" : "secondary"}>
                {profile.isAvailable ? "Available" : "Paused"}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {profile.area ? `${profile.area}, ` : ""}
                {profile.city} • Radius: {profile.preferredRadius} km
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={profile.isAvailable ? "outline" : "default"}
            size="sm"
            onClick={handleToggleAvailability}
            isLoading={isToggling}
            className={profile.isAvailable ? "border-gray-300 text-gray-700" : "bg-emerald-600 hover:bg-emerald-700"}
          >
            {profile.isAvailable ? "Pause Availability" : "Mark Available"}
          </Button>

          <Link href="/dashboard/donor/onboarding">
            <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600">
              <Sliders className="w-4 h-4" /> Preferences
            </Button>
          </Link>
        </div>
      </div>

      {/* Matched Urgent Blood Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-950 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" /> Matching Emergency Requests
            </h2>
            <p className="text-xs text-gray-500">
              Filtered for your {formatBloodGroup(profile.bloodGroup)} blood group in {profile.city}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchDonorData} className="text-xs gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-semibold text-gray-900 text-base">No urgent requests right now</h3>
            <p className="text-xs text-gray-500">
              All blood requests matching your blood group have been fulfilled or none are currently open in your area.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => {
              const hasVolunteered = volunteeredIds.includes(req.id);

              return (
                <Card key={req.id} className="hover:shadow-md transition-shadow border-gray-200 flex flex-col justify-between">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-12 h-12 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center text-xl">
                          {formatBloodGroup(req.bloodGroup)}
                        </span>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">
                            {req.unitsRequired} Units Required
                          </h3>
                          <p className="text-xs font-semibold text-red-600">{req.approximateDistance}</p>
                        </div>
                      </div>
                      <Badge className={getUrgencyColor(req.urgency)}>
                        {req.urgency}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 mb-5 bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">{req.hospitalName}</p>
                          <p className="text-gray-500 text-[11px] mt-0.5">{req.hospitalAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60">
                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>Needed by: {formatDateTime(req.requiredBy)}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      {hasVolunteered ? (
                        <div className="w-full py-2 bg-emerald-50 text-emerald-800 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-200">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Volunteered! Awaiting Requester Review
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleVolunteer(req.id)}
                          className="w-full bg-red-600 hover:bg-red-700 text-xs font-semibold gap-1.5 shadow-sm"
                        >
                          <Heart className="w-3.5 h-3.5 fill-white" />
                          I&apos;m willing to donate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
