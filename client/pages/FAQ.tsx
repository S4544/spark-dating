export default function FAQ() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-black text-gray-900 mb-8">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {[
            { q: "Is Spark free?", a: "Yes, Spark is completely free to use!" },
            { q: "How do I change my profile?", a: "Go to your profile page and click Edit to update your information." },
            { q: "Can I block someone?", a: "Yes, you can block users by tapping the block button on their profile." },
            { q: "How do matches work?", a: "When you and another user like each other, it's a match! You can then message." },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-gray-700">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
