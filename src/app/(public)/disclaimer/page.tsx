import { AlertTriangle, ShieldCheck } from "lucide-react";
import { MEDICAL_DISCLAIMER } from "@/lib/constants";

export default function MedicalDisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-gray-700">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-950 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
          Medical & Clinical Disclaimer
        </h1>
        <p className="text-sm text-gray-500 mt-1">Mandatory Notice for All Platform Users</p>
      </div>

      <div className="bg-amber-50 border border-amber-300 p-6 rounded-2xl space-y-3">
        <h2 className="text-base font-bold text-amber-950">Statutory Notice</h2>
        <p className="text-sm text-amber-900 leading-relaxed font-medium">
          {MEDICAL_DISCLAIMER}
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">Hospital Crossmatching & Screening</h3>
        <p className="text-sm leading-relaxed">
          Blood matching shown on BloodBridge is based purely on stated ABO and RhD antigen group
          compatibility. It does not replace clinical screening for transfusion-transmissible infections
          (HIV, HBV, HCV, Syphilis, Malaria) or laboratory crossmatching of donor and recipient blood
          samples, which must be executed by licensed blood transfusion officers.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">Emergency Protocol</h3>
        <p className="text-sm leading-relaxed">
          If you or someone in your care is experiencing an acute medical emergency with life-threatening
          hemorrhage, please immediately contact the nearest emergency department or blood bank directly
          in addition to utilizing BloodBridge.
        </p>
      </section>
    </div>
  );
}
