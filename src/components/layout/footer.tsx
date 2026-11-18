import Link from "next/link";
import { Heart, ShieldCheck, AlertCircle } from "lucide-react";
import { MEDICAL_DISCLAIMER } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white text-gray-600 text-sm">
      {/* Medical Disclaimer Banner */}
      <div className="bg-amber-50/70 border-b border-amber-200/60 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Medical Disclaimer: </span>
            {MEDICAL_DISCLAIMER}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <span className="font-bold text-lg text-gray-900">
                Blood<span className="text-red-600">Bridge</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Empowering communities with real-time, location-based blood donation matching.
              Connecting verified volunteer donors with patients in urgent need.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 py-1.5 px-2.5 rounded-md w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Kolkata Network</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/find-blood" className="hover:text-red-600 transition-colors">
                  Urgent Blood Requests
                </Link>
              </li>
              <li>
                <Link href="/become-donor" className="hover:text-red-600 transition-colors">
                  Register as Donor
                </Link>
              </li>
              <li>
                <Link href="/dashboard/requests/new" className="hover:text-red-600 transition-colors">
                  Create Blood Request
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-red-600 transition-colors">
                  How Matching Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-red-600 transition-colors">
                  Privacy Policy & Data Security
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-red-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-red-600 transition-colors">
                  Medical & Legal Disclaimer
                </Link>
              </li>
              <li>
                <span className="text-gray-400">Hospital Crossmatch Guidelines</span>
              </li>
            </ul>
          </div>

          {/* Contact & Region */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider">
              Emergency & Support
            </h4>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Serving Kolkata and Greater Bengal. Expandable nationwide.
            </p>
            <p className="text-xs text-gray-500">
              National Emergency Blood Helpline: <span className="font-semibold text-gray-900">104 / 1910</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              WhatsApp Notifications: <span className="font-semibold text-gray-900">Meta Cloud API</span>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} BloodBridge. All rights reserved.</p>
          <p>Built for human survival with emergency-grade reliability.</p>
        </div>
      </div>
    </footer>
  );
}
