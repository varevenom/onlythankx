export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f8f5f2] px-4">

      {/* LOGO */}
      <img
        src="/logo.png"
        alt="OnlyThankx"
        className="w-28 h-28 rounded-3xl mb-6 shadow-lg"
      />

      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-2 text-center">
        OnlyThankx ✌️
      </h1>

      {/* SUBTITLE */}
      <p className="text-gray-500 text-center mb-8">
        Share gratitude beautifully
      </p>

      {/* BUTTON */}
      <a
        href="/feed"
        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl shadow"
      >
        Enter Feed
      </a>

    </main>
  );
}