"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Clock, AlertTriangle } from "lucide-react";
import {
  formatBloodGroup,
  formatDateTime,
  getStatusColor,
  getUrgencyColor,
} from "@/lib/utils";

interface BloodRequestItem {
  id: string;
  bloodGroup: string;
  unitsRequired: number;
  unitsFulfilled: number;
  hospitalName: string;
  hospitalAddress: string;
  city: string;
  urgency: string;
  status: string;
  requiredBy: string;
  createdAt: string;
  requester: {
    id: string;
    name: string;
  };
  _count: {
    donorResponses: number;
  };
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<BloodRequestItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter
        ? `/api/admin/requests?status=${statusFilter}`
        : "/api/admin/requests";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setRequests(json.requests || []);
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Console
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Blood Request Moderation</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review hospital submissions and monitor emergency status across cities.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {["", "OPEN", "PARTIALLY_FILLED", "FULFILLED", "CANCELLED", "EXPIRED"].map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s || "All"}
              </button>
            )
          )}
        </div>
      </div>

      <Card className="border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Blood & Units</th>
                <th className="px-4 py-3">Hospital</th>
                <th className="px-4 py-3">Requester</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Volunteers</th>
                <th className="px-4 py-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No blood requests found.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3.5">
                      <span className="font-extrabold text-red-600 text-sm">
                        {formatBloodGroup(r.bloodGroup)}
                      </span>
                      <div className="text-gray-500">
                        {r.unitsFulfilled}/{r.unitsRequired} units
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900">{r.hospitalName}</div>
                      <div className="text-gray-500">{r.city}</div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">{r.requester.name}</td>
                    <td className="px-4 py-3.5">
                      <Badge className={getUrgencyColor(r.urgency)}>{r.urgency}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className={getStatusColor(r.status)}>{r.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      {r._count.donorResponses} donor(s)
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/dashboard/requests/${r.id}`}>
                        <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                          Inspect
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
