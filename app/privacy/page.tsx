export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <section className="rounded-[32px] border border-orange-100 bg-white p-8 shadow-[0_10px_40px_rgba(255,140,90,0.08)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Privacy
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Privacy Policy
        </h1>
        <div className="mt-4 space-y-4 text-[15px] leading-8 text-gray-600">
          <p>
            We value your privacy. OnlyThankx stores account and content data needed
            to operate the platform, such as profile information, posts, and user
            interactions.
          </p>
          <p>
            We do not sell your personal information. We use reasonable measures to
            protect user data and keep the service functioning securely.
          </p>
          <p>
            By using OnlyThankx, you understand that content you choose to post may
            be visible to others based on how the platform is configured.
          </p>
        </div>
      </section>
    </main>
  )
}