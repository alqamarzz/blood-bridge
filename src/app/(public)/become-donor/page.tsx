import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle, Heart, ArrowRight } from "lucide-react";
import { MIN_DONATION_INTERVAL_DAYS, MEDICAL_DISCLAIMER } from "@/lib/constants";

export default function BecomeDonorPage() {
  const eligibility = [
    "Age between 18 and 65 years",
    "Weight at least 45 kg (50 kg for platelet donation)",
    "Hemoglobin level at least 12.5 g/dL",
    `At least ${MIN_DONATION_INTERVAL_DAYS} days (3 months) since your last blood donation`,
    "Normal pulse (60-100 bpm) and blood pressure",
    "No history of hepatitis B, hepatitis C, HIV, or heart disease",
    "No major surgery in the past 6 months",
    "Not currently pregnant or breastfeeding",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mx-auto">
          <Heart className="w-7 h-7 fill-current" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950">
          Become a Volunteer Blood Donor
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          One blood donation can save up to three lives. Register your availability so we can
          alert you when someone near you is in urgent need.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-900">General Donor Eligibility Guidelines (India)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {eligibility.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 italic">
          * Final medical eligibility is always evaluated by qualified physicians at the blood bank prior to donation.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
          <AlertCircle className="w-4 h-4 text-amber-700" />
          <span>Medical Notice</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          {MEDICAL_DISCLAIMER}
        </p>
      </div>

      <div className="text-center space-y-4">
        <Link href="/dashboard/donor/onboarding">
          <Button size="lg" className="bg-red-600 hover:bg-red-700 gap-2 shadow-md">
            Complete Donor Registration <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <p className="text-xs text-gray-500">
          Already registered? Log in to toggle your availability or update search radius.
        </p>
      </div>
    </div>
  );
}
