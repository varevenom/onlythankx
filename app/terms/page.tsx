export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <section className="rounded-[32px] border border-orange-100 bg-white p-8 shadow-[0_10px_40px_rgba(255,140,90,0.08)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Terms
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Terms of Service
        </h1>
        <div className="mt-4 space-y-4 text-[15px] leading-8 text-gray-600">
          <p>
            By using OnlyThankx, you agree to use the platform respectfully and
            responsibly.
          </p>
          <p>
            You may not post unlawful, abusive, misleading, or harmful content.
            Accounts or content that violate platform standards may be removed.
          </p>
          <p>
            We may update the service and these terms over time as the platform
            grows.
          </p>
        </div>
      </section>
    </main>
  )
}