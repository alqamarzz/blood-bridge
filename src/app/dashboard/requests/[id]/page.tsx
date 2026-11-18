"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  Heart,
  CheckCircle,
  XCircle,
  Phone,
  AlertCircle,
  ArrowLeft,
  Users,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  formatBloodGroup,
  formatDateTime,
  getStatusColor,
  getUrgencyColor,
  timeAgo,
} from "@/lib/utils";

interface DonorResponse {
  id: string;
  status: "INTERESTED" | "ACCEPTED" | "IGNORED" | "WITHDRAWN" | "COMPLETED";
  statusMessage: string | null;
  createdAt: string;
  donor: {
    id: string;
    name: string;
    phone: string;
    donorProfile: {
      bloodGroup: string;
      city: string;
      area: string | null;
    } | null;
  };
}

interface RequestDetail {
  id: string;
  requesterId: string;
  bloodGroup: string;
  unitsRequired: number;
  unitsFulfilled: number;
  hospitalName: string;
  hospitalAddress: string;
  city: string;
  requiredBy: string;
  urgency: string;
  status: string;
  contactPhone: string | null;
  additionalInformation: string | null;
  createdAt: string;
  requester: {
    id: string;
    name: string;
  };
  donorResponses: DonorResponse[];
}

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchRequest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/requests/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setRequest(json.data);
      } else {
        setActionError(json.error || "Failed to load request details");
      }
    } catch {
      setActionError("Network error while loading request.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleUpdateResponse = async (
    responseId: string,
    status: "ACCEPTED" | "IGNORED"
  ) => {
    setProcessingId(responseId);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const json = await res.json();

      if (!res.ok) {
        setActionError(json.error || "Failed to update response");
      } else {
        setActionSuccess(
          status === "ACCEPTED"
            ? "Donor accepted! Donor has been notified on WhatsApp. Contact info unlocked."
            : "Donor ignored."
        );
        fetchRequest();
      }
    } catch {
      setActionError("Network error occurred.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusChange = async (newStatus: "FULFILLED" | "CANCELLED") => {
    if (!confirm(`Are you sure you want to mark this request as ${newStatus}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setActionSuccess(`Request marked as ${newStatus}`);
        fetchRequest();
      }
    } catch {
      setActionError("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-600 mb-2" />
        <p className="text-sm">Loading blood request details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-bold">Request Not Found</h2>
        <Link href="/dashboard/requests">
          <Button variant="outline">Back to Requests</Button>
        </Link>
      </div>
    );
  }

  const interestedResponses = request.donorResponses.filter(
    (r) => r.status === "INTERESTED"
  );
  const acceptedResponses = request.donorResponses.filter(
    (r) => r.status === "ACCEPTED"
  );
  const ignoredResponses = request.donorResponses.filter(
    (r) => r.status === "IGNORED"
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/requests"
          className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Requests
        </Link>

        {request.status === "OPEN" || request.status === "PARTIALLY_FILLED" ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("CANCELLED")}
              className="text-gray-600 hover:text-red-600 text-xs"
            >
              Cancel Request
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusChange("FULFILLED")}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs"
            >
              Mark Fulfilled
            </Button>
          </div>
        ) : (
          <Badge className={getStatusColor(request.status)}>
            {request.status}
          </Badge>
        )}
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Request Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <span className="w-16 h-16 rounded-2xl bg-red-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-sm">
              {formatBloodGroup(request.bloodGroup)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-950">
                  {request.unitsFulfilled} of {request.unitsRequired} Units Fulfilled
                </h1>
                <Badge className={getUrgencyColor(request.urgency)}>
                  {request.urgency}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Requested by {request.requester.name} • {timeAgo(request.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-red-600" /> Hospital & Location
            </h3>
            <p className="font-bold text-gray-950">{request.hospitalName}</p>
            <p className="text-xs text-gray-600">{request.hospitalAddress}</p>
            <p className="text-xs text-gray-500 font-medium">City: {request.city}</p>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-red-600" /> Urgency & Schedule
            </h3>
            <p className="font-bold text-gray-950">
              Required by: {formatDateTime(request.requiredBy)}
            </p>
            {request.additionalInformation && (
              <p className="text-xs text-gray-600 italic">
                &ldquo;{request.additionalInformation}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Interested Donors Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
          <Users className="w-5 h-5 text-red-600" /> Responding Donors ({request.donorResponses.length})
        </h2>

        {request.donorResponses.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500 space-y-1">
            <p className="font-semibold text-gray-900">No donors have volunteered yet</p>
            <p className="text-xs">
              Nearby matching donors have been alerted. You will receive a WhatsApp message when someone volunteers.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 1. Pending (Interested) Donors */}
            {interestedResponses.map((r) => (
              <div
                key={r.id}
                className="bg-white p-5 rounded-xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-950 text-sm">{r.donor.name}</span>
                    <Badge variant="warning">Interested (Action Required)</Badge>
                    <span className="text-xs font-semibold text-red-600">
                      {formatBloodGroup(r.donor.donorProfile?.bloodGroup || request.bloodGroup)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Location: {r.donor.donorProfile?.area ? `${r.donor.donorProfile.area}, ` : ""}{r.donor.donorProfile?.city || request.city} • Volunteered {timeAgo(r.createdAt)}
                  </p>
                  {r.statusMessage && (
                    <p className="text-xs text-gray-700 italic mt-1 bg-amber-50/50 p-2 rounded">
                      &ldquo;{r.statusMessage}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateResponse(r.id, "IGNORED")}
                    isLoading={processingId === r.id}
                    className="text-gray-600 hover:text-gray-900 text-xs"
                  >
                    Ignore
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateResponse(r.id, "ACCEPTED")}
                    isLoading={processingId === r.id}
                    className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Accept Donor
                  </Button>
                </div>
              </div>
            ))}

            {/* 2. Accepted Donors */}
            {acceptedResponses.map((r) => (
              <div
                key={r.id}
                className="bg-emerald-50/40 p-5 rounded-xl border border-emerald-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-950 text-sm">{r.donor.name}</span>
                    <Badge variant="success">Accepted</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-900 font-semibold pt-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Contact Phone: {r.donor.phone}</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Accepted on {formatDateTime(r.createdAt)}. Coordinate hospital blood bank timings directly.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-white px-3 py-1.5 rounded-lg border border-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Ready for Crossmatch
                </div>
              </div>
            ))}

            {/* 3. Ignored Responses */}
            {ignoredResponses.map((r) => (
              <div
                key={r.id}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 opacity-60 flex items-center justify-between text-xs text-gray-500"
              >
                <span>{r.donor.name} (Ignored)</span>
                <span className="text-[11px]">{timeAgo(r.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
