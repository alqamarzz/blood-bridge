import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, PlusCircle } from "lucide-react";
import { formatBloodGroup, formatDateTime, getUrgencyColor } from "@/lib/utils";
import { MOCK_BLOOD_REQUESTS, withDbTimeout } from "@/lib/mock-data";

export default async function FindBloodPage({
  searchParams,
}: {
  searchParams: Promise<{ bloodGroup?: string; city?: string }>;
}) {
  const { bloodGroup, city } = await searchParams;

  // Filter fallback data in case DB is offline/slow
  let fallbackData = MOCK_BLOOD_REQUESTS;
  if (bloodGroup) {
    fallbackData = fallbackData.filter((r) => r.bloodGroup === bloodGroup);
  }
  if (city) {
    fallbackData = fallbackData.filter((r) => r.city.toLowerCase() === city.toLowerCase());
  }

  const where: Record<string, unknown> = {
    status: { in: ["OPEN", "PARTIALLY_FILLED"] },
    requiredBy: { gt: new Date() },
  };

  if (bloodGroup) where.bloodGroup = bloodGroup;
  if (city) where.city = city;

  // Query database with 500ms timeout to prevent navigation freezes
  const requests = await withDbTimeout(
    prisma.bloodRequest.findMany({
      where,
      include: {
        requester: { select: { name: true } },
        _count: { select: { donorResponses: true } },
      },
      orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
    }),
    fallbackData as never,
    500
  );

  const bloodGroupOptions = [
    "A_POS", "A_NEG", "B_POS", "B_NEG",
    "AB_POS", "AB_NEG", "O_POS", "O_NEG",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950">Active Blood Requests</h1>
          <p className="text-sm text-gray-600 mt-1">
            Real-time emergency blood requirements across hospitals.
          </p>
        </div>
        <Link href="/dashboard/requests/new">
          <Button className="bg-red-600 hover:bg-red-700 gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" /> Create Blood Request
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">
          Filter by Blood Group:
        </span>
        <Link
          href="/find-blood"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            !bloodGroup
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Groups
        </Link>
        {bloodGroupOptions.map((bg) => (
          <Link
            key={bg}
            href={`/find-blood?bloodGroup=${bg}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              bloodGroup === bg
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {formatBloodGroup(bg)}
          </Link>
        ))}
      </div>

      {/* Requests Grid */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 text-base">No active requests found</h3>
          <p className="text-xs text-gray-500">
            {bloodGroup
              ? `There are currently no urgent requests for blood group ${formatBloodGroup(bloodGroup)}.`
              : "There are currently no open blood requests."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <Card key={req.id} className="hover:shadow-md transition-shadow border-gray-200 flex flex-col justify-between">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center text-xl shadow-sm">
                      {formatBloodGroup(req.bloodGroup)}
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {req.unitsRequired} Unit{req.unitsRequired > 1 ? "s" : ""} Required
                      </h3>
                      <p className="text-xs text-gray-500">{req.city}</p>
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

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">
                    {req._count.donorResponses} donor(s) volunteered
                  </span>
                  <Link href={`/dashboard/requests/${req.id}`}>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
