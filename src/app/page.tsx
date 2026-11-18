import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Search,
  MapPin,
  Clock,
  Shield,
  MessageCircle,
  Users,
  Activity,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { formatBloodGroup, formatDateTime, getUrgencyColor } from "@/lib/utils";
import { MOCK_BLOOD_REQUESTS, withDbTimeout } from "@/lib/mock-data";

async function fetchFromDb() {
  const [
    activeCount,
    fulfilledCount,
    donorCount,
    urgentRequests,
  ] = await Promise.all([
    prisma.bloodRequest.count({
      where: { status: { in: ["OPEN", "PARTIALLY_FILLED"] } },
    }),
    prisma.bloodRequest.count({
      where: { status: "FULFILLED" },
    }),
    prisma.donorProfile.count({
      where: { isAvailable: true },
    }),
    prisma.bloodRequest.findMany({
      where: {
        status: { in: ["OPEN", "PARTIALLY_FILLED"] },
        requiredBy: { gt: new Date() },
      },
      include: {
        requester: { select: { name: true } },
        _count: { select: { donorResponses: true } },
      },
      orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
      take: 3,
    }),
  ]);

  return {
    activeCount,
    fulfilledCount,
    donorCount,
    urgentRequests,
  };
}

async function getHomePageData() {
  const fallback = {
    activeCount: MOCK_BLOOD_REQUESTS.length,
    fulfilledCount: 14,
    donorCount: 38,
    urgentRequests: MOCK_BLOOD_REQUESTS.slice(0, 3) as never,
  };

  return withDbTimeout(fetchFromDb(), fallback, 500);
}

export default async function HomePage() {
  const { activeCount, fulfilledCount, donorCount, urgentRequests } =
    await getHomePageData();

  const bloodTypes = [
    { type: "O+", canGiveTo: ["O+", "A+", "B+", "AB+"], canReceiveFrom: ["O+", "O-"] },
    { type: "O-", canGiveTo: ["All blood types (Universal Donor)"], canReceiveFrom: ["O- only"] },
    { type: "A+", canGiveTo: ["A+", "AB+"], canReceiveFrom: ["A+", "A-", "O+", "O-"] },
    { type: "A-", canGiveTo: ["A+", "A-", "AB+", "AB-"], canReceiveFrom: ["A-", "O-"] },
    { type: "B+", canGiveTo: ["B+", "AB+"], canReceiveFrom: ["B+", "B-", "O+", "O-"] },
    { type: "B-", canGiveTo: ["B+", "B-", "AB+", "AB-"], canReceiveFrom: ["B-", "O-"] },
    { type: "AB+", canGiveTo: ["AB+ only"], canReceiveFrom: ["All types (Universal Recipient)"] },
    { type: "AB-", canGiveTo: ["AB+", "AB-"], canReceiveFrom: ["AB-", "A-", "B-", "O-"] },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/50 via-white to-gray-50/30 pt-16 pb-20 border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100/80 border border-red-200 text-red-700 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              Active Emergency Blood Network — Kolkata & Bengal
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.15]">
              When seconds count, <br />
              <span className="text-red-600 underline decoration-red-200 underline-offset-8">
                BloodBridge
              </span>{" "}
              connects nearby donors.
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 font-normal leading-relaxed">
              A rapid, location-based platform directly notifying nearby verified donors
              when a patient urgently needs blood. Instant WhatsApp coordination.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/dashboard/requests/new" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 shadow-md text-base gap-2">
                  <Search className="w-5 h-5" />
                  Find Blood Urgently
                </Button>
              </Link>
              <Link href="/become-donor" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-gray-300 hover:bg-gray-50 text-gray-900 text-base gap-2"
                >
                  <Heart className="w-5 h-5 text-red-600 fill-red-50" />
                  Become a Volunteer Donor
                </Button>
              </Link>
            </div>

            {/* Live Database Metrics */}
            <div className="pt-10 grid grid-cols-3 gap-4 border-t border-gray-200/70 max-w-2xl mx-auto">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-red-600">{activeCount}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Active Requests</p>
              </div>
              <div className="text-center border-x border-gray-200/70">
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{fulfilledCount}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Fulfilled Requests</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{donorCount}</p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Available Donors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Urgent Requests Preview */}
      {urgentRequests.length > 0 && (
        <section className="py-12 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-950 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-red-600" /> Urgent Blood Needs
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Patients currently seeking matching donors in hospitals</p>
              </div>
              <Link href="/find-blood" className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1">
                View all ({activeCount}) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {urgentRequests.map((req) => (
                <Card key={req.id} className="hover:shadow-md transition-shadow border-gray-200 flex flex-col justify-between">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-11 h-11 rounded-lg bg-red-600 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
                          {formatBloodGroup(req.bloodGroup)}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{req.unitsRequired} Units Required</p>
                          <p className="text-xs text-gray-500">{req.city}</p>
                        </div>
                      </div>
                      <Badge className={getUrgencyColor(req.urgency)}>
                        {req.urgency}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-900 truncate">{req.hospitalName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>Needed by: {formatDateTime(req.requiredBy)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <span>{req._count.donorResponses} donor(s) responded</span>
                      <Link href={`/dashboard/requests/${req.id}`}>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-8">
                          View & Volunteer
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-16 bg-[#FAFAFA] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-950">How BloodBridge Works</h2>
            <p className="text-gray-600 text-sm mt-2">
              A transparent, safe, and privacy-first four-step workflow built for emergencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 font-bold text-lg flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="font-semibold text-gray-900 text-base">Create Request</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Enter hospital, blood group, units, and urgency level. Server validates inputs instantly.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 font-bold text-lg flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="font-semibold text-gray-900 text-base">Nearby Match Engine</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Geospatial engine scans registered donors in 5km, 10km, and 20km rings with location privacy.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 font-bold text-lg flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="font-semibold text-gray-900 text-base">Donor Volunteers</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Donor clicks "I'm willing to donate". The requester receives instant WhatsApp alert.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 font-bold text-lg flex items-center justify-center mx-auto">
                4
              </div>
              <h3 className="font-semibold text-gray-900 text-base">Coordinate at Hospital</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Requester accepts donor. Both parties coordinate securely with hospital blood bank.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blood Group Compatibility Reference Matrix */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-950">Blood Group Reference</h2>
            <p className="text-gray-600 text-sm mt-2">
              Understand ABO/Rh compatibility. Licensed blood banks perform mandatory crossmatching.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bloodTypes.map((b) => (
              <div
                key={b.type}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-extrabold text-red-600">{b.type}</span>
                  <Badge variant="outline" className="text-[10px] font-medium border-gray-300">
                    Compatibility
                  </Badge>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium text-gray-500 block">Can donate to:</span>
                    <span className="text-gray-900 font-medium">{b.canGiveTo.join(", ")}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500 block">Can receive from:</span>
                    <span className="text-gray-900 font-medium">{b.canReceiveFrom.join(", ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why BloodBridge / Safety & Trust */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Location Privacy First</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Exact donor coordinates are never displayed. Requester only sees approximate distance
                  rings (e.g., "About 2-5 km away").
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Official Meta WhatsApp API</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Fast emergency updates through WhatsApp Cloud API. Secure review links ensure no public
                  leakage of patient details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Clinical Integrity</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  We don't replace blood banks. Every transfusion must undergo standard hospital lab testing
                  and crossmatching.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
