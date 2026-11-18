"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Search,
  Shield,
  ShieldAlert,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { formatBloodGroup, formatDateTime } from "@/lib/utils";

interface UserItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  phoneVerified: boolean;
  suspended: boolean;
  createdAt: string;
  donorProfile: {
    bloodGroup: string;
    city: string;
    isAvailable: boolean;
  } | null;
  _count: {
    bloodRequests: number;
    donorResponses: number;
    reportsReceived: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const url = search
        ? `/api/admin/users?search=${encodeURIComponent(search)}`
        : "/api/admin/users";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setUsers(json.users || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const toggleSuspension = async (userId: string, currentSuspended: boolean) => {
    setProcessingId(userId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suspended: !currentSuspended,
          reason: currentSuspended
            ? undefined
            : "Suspended by admin for moderation review",
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setMessage(json.message);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, suspended: !currentSuspended } : u
          )
        );
      }
    } catch {
      setMessage("Failed to update user status");
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
        <h1 className="text-2xl font-bold text-gray-950">User Management</h1>
        <p className="text-xs text-gray-500 mt-1">
          Monitor registered users, donor profiles, and manage suspensions.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-gray-900 text-white rounded-lg text-xs font-medium">
          {message}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        <Input
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-xs"
        />
      </div>

      {/* Table */}
      <Card className="border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Donor Profile</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900">{u.name}</div>
                      <div className="text-gray-500">{u.phone}</div>
                      {u.email && <div className="text-gray-400">{u.email}</div>}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={u.role === "ADMIN" ? "warning" : "secondary"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      {u.donorProfile ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-red-600">
                            {formatBloodGroup(u.donorProfile.bloodGroup)}
                          </span>
                          <div className="text-gray-500">{u.donorProfile.city}</div>
                          <Badge
                            variant={u.donorProfile.isAvailable ? "success" : "secondary"}
                            className="text-[10px]"
                          >
                            {u.donorProfile.isAvailable ? "Available" : "Paused"}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not registered</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">
                      <div>Requests: {u._count.bloodRequests}</div>
                      <div>Volunteered: {u._count.donorResponses}</div>
                      {u._count.reportsReceived > 0 && (
                        <div className="text-red-600 font-semibold">
                          Reports: {u._count.reportsReceived}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {u.suspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {u.role !== "ADMIN" && (
                        <Button
                          size="sm"
                          variant={u.suspended ? "outline" : "destructive"}
                          onClick={() => toggleSuspension(u.id, u.suspended)}
                          isLoading={processingId === u.id}
                          className="text-xs h-7 px-2.5"
                        >
                          {u.suspended ? "Reactivate" : "Suspend"}
                        </Button>
                      )}
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
