import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminDashboardStats } from "@/services/admin.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Heart,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard/requests");
  }

  const stats = await getAdminDashboardStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" /> Administrative Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
            Platform Moderation & Metrics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time monitoring of users, blood requests, and emergency dispatch health.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Users
            </CardTitle>
            <Users className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-950">{stats.totalUsers}</div>
            <p className="text-[11px] text-gray-500 mt-1">Verified phone accounts</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Registered Donors
            </CardTitle>
            <Heart className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalDonors}</div>
            <p className="text-[11px] text-gray-500 mt-1">Geolocated profiles</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Active Requests
            </CardTitle>
            <Activity className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.activeRequests}</div>
            <p className="text-[11px] text-gray-500 mt-1">Awaiting donor match</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fulfilled Requests
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.fulfilledRequests}</div>
            <p className="text-[11px] text-gray-500 mt-1">Units matched & accepted</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Modules Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/users" className="block group">
          <Card className="h-full border-gray-200 hover:border-gray-400 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-gray-900 group-hover:text-red-600">
                  User Management
                </CardTitle>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 leading-relaxed">
                Inspect registered users, view donor parameters, manage verification, or suspend abusive accounts.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/requests" className="block group">
          <Card className="h-full border-gray-200 hover:border-gray-400 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-gray-900 group-hover:text-red-600">
                  Request Moderation
                </CardTitle>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 leading-relaxed">
                Review live hospital blood requirements, investigate suspicious activity, and moderate requests.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/reports" className="block group">
          <Card className="h-full border-gray-200 hover:border-gray-400 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-gray-900 group-hover:text-red-600">
                  Abuse Reports
                </CardTitle>
                <Badge variant={stats.pendingReports > 0 ? "destructive" : "secondary"}>
                  {stats.pendingReports} Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 leading-relaxed">
                Investigate user complaints regarding fake requests, commercial blood sales, or harassment.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
