import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Heart, MessageSquare, CheckCircle, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Requester Registers & Submits Need",
      desc: "A patient family member or hospital attendant creates an account and specifies the required blood group, units, hospital address, and urgency deadline.",
      icon: Search,
    },
    {
      num: "02",
      title: "Geospatial Matching Engine",
      desc: "BloodBridge evaluates compatible registered donors within 5 km, 10 km, and 20 km search radii. In-app and direct notifications are queued.",
      icon: Heart,
    },
    {
      num: "03",
      title: "Donor Volunteers With One Click",
      desc: "When a notified donor taps 'I'm willing to donate', the requester receives an automated WhatsApp alert containing a secure donor-review link.",
      icon: MessageSquare,
    },
    {
      num: "04",
      title: "Acceptance & Hospital Coordination",
      desc: "The requester accepts the donor. Both parties coordinate directly at the hospital blood bank for mandatory screening and crossmatching.",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950">
          How BloodBridge Works
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          From hospital requirement to willing donor at the blood bank in minutes.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-extrabold text-xl shrink-0">
                {s.num}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-base font-bold text-gray-900">{s.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
              <div className="hidden sm:block p-3 rounded-full bg-gray-50 text-gray-400">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8 rounded-2xl text-center space-y-4 shadow-md">
        <h2 className="text-2xl font-bold">Ready to be part of the life-saving network?</h2>
        <p className="text-sm text-red-100 max-w-xl mx-auto">
          Whether you need blood or are willing to donate for someone in your city, join today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/register">
            <Button size="lg" className="bg-white text-red-700 hover:bg-gray-100 font-semibold">
              Create an Account
            </Button>
          </Link>
          <Link href="/find-blood">
            <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10">
              Browse Active Requests
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
