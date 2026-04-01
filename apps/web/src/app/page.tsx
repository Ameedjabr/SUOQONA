import ChatWidget from "../components/ChatWidget";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          Souqona
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Professional E-Commerce Platform
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/api/health"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            API Health Check
          </a>
        </div>
      </div>

      {/* Shopping Assistant Chatbot */}
      <ChatWidget />
    </main>
  );
}
