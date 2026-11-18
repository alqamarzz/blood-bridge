import { Shield, Heart, Users, Target } from "lucide-react";
import { MEDICAL_DISCLAIMER } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
          About BloodBridge
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Bridging the critical gap between emergency blood needs and willing volunteer donors
          through modern, location-aware technology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Our Mission</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            In medical emergencies, families often spend critical hours calling contacts or broadcasting
            frantic messages on social media with no verification or location context. BloodBridge solves
            this with automated, geospatial candidate matching that alerts donors within a 5–20km radius.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Privacy & Ethics</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Donors' exact home coordinates and personal telephone numbers are never published openly.
            Communication occurs through verified channels, and contact information is only revealed
            upon mutual consent for hospital coordination.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Initial Target: Kolkata, West Bengal</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Kolkata is home to major government medical colleges (such as Medical College Kolkata, NRS Medical
          College, RG Kar, SSKM Hospital) and private healthcare facilities serving millions across Eastern India.
          BloodBridge is tailored to Kolkata's urban density and transportation networks, with an architectural
          foundation ready for pan-India expansion.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl space-y-2">
        <h3 className="font-semibold text-amber-900 text-sm">Regulatory & Medical Standing</h3>
        <p className="text-xs text-amber-800 leading-relaxed">
          {MEDICAL_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
