export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-gray-700">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-950">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mt-1">Effective Date: November 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">1. Information We Collect</h2>
        <p className="text-sm leading-relaxed">
          BloodBridge collects your name, telephone number, optional email address, blood group,
          and geographic location data solely for facilitating emergency blood donation matching.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">2. Geolocation Privacy & Masking</h2>
        <p className="text-sm leading-relaxed">
          We strictly do not share exact latitude and longitude coordinates of volunteer donors
          with requesters or the public. The application calculates distances internally and only
          surfaces coarse approximate indicators (such as "About 2-5 km away").
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">3. Telephone Number & WhatsApp Communications</h2>
        <p className="text-sm leading-relaxed">
          Phone numbers are verified via OTP. With explicit opt-in, we dispatch notifications via
          the official Meta WhatsApp Cloud API. We do not sell or lease user contact data to any
          third parties or advertisers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">4. User Rights & Data Deletion</h2>
        <p className="text-sm leading-relaxed">
          Users maintain full control over their availability status and can request profile deactivation
          or complete data deletion at any time via their dashboard or support channels.
        </p>
      </section>
    </div>
  );
}
