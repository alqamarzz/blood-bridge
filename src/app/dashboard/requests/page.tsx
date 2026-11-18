import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Clock, MapPin, Users, Activity } from "lucide-react";
import { formatBloodGroup, formatDateTime, getStatusColor, getUrgencyColor } from "@/lib/utils";

export default async function RequesterRequestsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const requests = await prisma.bloodRequest.findMany({
    where: { requesterId: session.user.id },
    include: {
      _count: {
        select: { donorResponses: true },
      },
      donorResponses: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-950">My Blood Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track volunteer donors and manage fulfillment status for your requests.
          </p>
        </div>
        <Link href="/dashboard/requests/new">
          <Button className="bg-red-600 hover:bg-red-700 gap-1.5 shadow-sm">
            <PlusCircle className="w-4 h-4" /> New Blood Request
          </Button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 text-base">No blood requests submitted yet</h3>
          <p className="text-xs text-gray-500">
            When you create an emergency blood request, you can monitor responding donors right here.
          </p>
          <Link href="/dashboard/requests/new">
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              Create First Request
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => {
            const acceptedCount = req.donorResponses.filter((r) => r.status === "ACCEPTED").length;
            const interestedCount = req.donorResponses.filter((r) => r.status === "INTERESTED").length;

            return (
              <Card key={req.id} className="hover:shadow-md transition-shadow border-gray-200 flex flex-col justify-between">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-12 h-12 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center text-xl shadow-sm">
                        {formatBloodGroup(req.bloodGroup)}
                      </span>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          {req.unitsFulfilled} / {req.unitsRequired} Units Fulfilled
                        </h3>
                        <p className="text-xs text-gray-500">{req.city}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(req.status)}>
                      {req.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 mb-5 bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span className="font-medium text-gray-900 truncate">{req.hospitalName}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Required by: {formatDateTime(req.requiredBy)}</span>
                    </div>
                  </div>

                  {/* Donor responses count badge */}
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-700">
                        {interestedCount} pending • {acceptedCount} accepted
                      </span>
                    </div>
                    <Link href={`/dashboard/requests/${req.id}`}>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-xs">
                        Manage & Review
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
