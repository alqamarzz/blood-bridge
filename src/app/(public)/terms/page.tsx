export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-gray-700">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-950">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mt-1">Last Updated: November 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">1. Nature of the Platform</h2>
        <p className="text-sm leading-relaxed">
          BloodBridge is a technology platform connecting individuals in need of blood with voluntary,
          non-remunerated potential donors. BloodBridge is neither a licensed blood bank nor a healthcare
          provider.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">2. Prohibition of Commercial Blood Trade</h2>
        <p className="text-sm leading-relaxed">
          In strict compliance with the National Blood Policy of India and the Supreme Court of India
          directives (1996), commercial trading, selling, or buying of human blood or blood components
          is strictly illegal. Users engaging in or demanding financial remuneration will face immediate
          account suspension and report to law enforcement authorities.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">3. User Responsibility & Accurate Information</h2>
        <p className="text-sm leading-relaxed">
          Requesters agree to submit genuine requirements with valid hospital information. Falsification
          of blood requests is subject to platform blacklisting and legal action.
        </p>
      </section>
    </div>
  );
}
