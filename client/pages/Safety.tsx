export default function Safety() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h1 className="text-4xl font-black text-gray-900 mb-8">Safety Tips</h1>
          <div className="space-y-6">
            {[
              { title: "✔️ Verify Profiles", desc: "Check photos and bios carefully before connecting." },
              { title: "✔️ Meet in Public", desc: "Always meet first dates in public places." },
              { title: "✔️ Tell Someone", desc: "Let a friend know where you're going." },
              { title: "✔️ Trust Your Gut", desc: "If something feels off, don't ignore it." },
              { title: "✔️ Protect Personal Info", desc: "Don't share your address or financial details." },
              { title: "✔️ Report Issues", desc: "Use the report button to flag inappropriate behavior." },
            ].map((item, i) => (
              <div key={i} className="border-l-4 border-rose-500 pl-4">
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
