"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface ReportItem {
  id: string;
  reason: string;
  description: string;
  status: "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
  adminNotes: string | null;
  createdAt: string;
  reporter: {
    id: string;
    name: string;
    phone: string;
  };
  reportedUser?: {
    id: string;
    name: string;
    phone: string;
    suspended: boolean;
  } | null;
  request?: {
    id: string;
    bloodGroup: string;
    hospitalName: string;
  } | null;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reports");
      // If no admin report listing route exists yet, let's create it or fetch directly
      const json = await res.json();
      if (json.success) {
        setReports(json.reports || []);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (
    reportId: string,
    status: "RESOLVED" | "DISMISSED"
  ) => {
    setProcessingId(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNotes: `Marked as ${status} by admin`,
        }),
      });

      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status } : r))
        );
      }
    } catch {
      console.error("Failed to update report status");
    } finally {
      setProcessingId(null);
    }
  };

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

      <div>
        <h1 className="text-2xl font-bold text-gray-950">Abuse Reports & Moderation</h1>
        <p className="text-xs text-gray-500 mt-1">
          Investigate user reports regarding fake requests, commercial blood sales, or harassment.
        </p>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card className="p-8 text-center text-sm text-gray-500 border-gray-200">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-gray-900">Zero pending abuse reports</p>
            <p className="text-xs mt-1">
              All reported items have been reviewed or no active complaints are filed.
            </p>
          </Card>
        ) : (
          reports.map((r) => (
            <Card key={r.id} className="p-5 border-gray-200 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.status === "PENDING" ? "destructive" : "secondary"}>
                      {r.status}
                    </Badge>
                    <span className="font-bold text-sm text-gray-900">{r.reason}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Reported by {r.reporter.name} ({r.reporter.phone}) on {formatDateTime(r.createdAt)}
                  </p>
                </div>

                {r.status === "PENDING" && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(r.id, "DISMISSED")}
                      isLoading={processingId === r.id}
                      className="text-xs"
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(r.id, "RESOLVED")}
                      isLoading={processingId === r.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                    >
                      Resolve & Action
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="font-semibold block mb-0.5">Details:</span>
                {r.description}
              </div>

              {r.reportedUser && (
                <div className="text-xs text-gray-600 flex items-center gap-2">
                  <span className="font-medium">Target User:</span>
                  <span>{r.reportedUser.name} ({r.reportedUser.phone})</span>
                  {r.reportedUser.suspended && (
                    <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
