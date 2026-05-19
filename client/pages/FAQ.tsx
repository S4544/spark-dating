import { Link } from "react-router-dom";
import { useState } from "react";
const faqs = [
  ["Is Spark free to use?", "Yes! Spark is free to join and use. You can browse profiles, like people, and get matches at no cost."],
  ["What age do I need to be?", "You must be at least 18 years old to create an account on Spark. We take this seriously and may request age verification."],
  ["How does matching work?", "When you like someone and they like you back, it's a match! You'll both be notified and can start chatting."],
  ["Is my location shared with other users?", "No. We only show other users your approximate distance (e.g., '2.3 km away'), never your exact location."],
  ["How do I delete my account?", "Go to Profile → Settings → Delete Account. Your data will be permanently removed within 30 days."],
  ["Can I report a user?", "Yes. Tap the flag icon on any profile to report it. Our safety team reviews all reports within 24 hours."],
  ["Why can't I see any profiles?", "Make sure your profile is complete (photo, bio, gender, preferences). Also check that your location permissions are enabled."],
  ["Is my data safe?", "We use industry-standard encryption and never sell your data. See our Privacy Policy for full details."],
  ["How do I reset my password?", "On the login page, tap 'Forgot Password' and we'll send a reset link to your email."],
  ["How do I contact support?", "Email us at support@sparkdate.app and we'll respond within 24 hours."],
];
export default function FAQ() {
  const [open, setOpen] = useState<number|null>(null);
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-rose-500">🔥 Spark</Link>
        <Link to="/signup" className="bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold">Get Started</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-500 mb-10">Everything you need to know about Spark</p>
        <div className="space-y-3">
          {faqs.map(([q,a],i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <button onClick={() => setOpen(open===i?null:i)} className="w-full text-left px-6 py-4 flex items-center justify-between font-semibold text-gray-900">
                {q}
                <span className="text-rose-500 text-xl">{open===i?"−":"+"}</span>
              </button>
              {open===i && <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">{a}</div>}
            </div>
          ))}
        </div>
        <div className="mt-12 bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center">
          <p className="text-gray-700 font-semibold mb-2">Still have questions?</p>
          <p className="text-gray-500 text-sm mb-4">Our support team is here to help</p>
          <a href="mailto:support@sparkdate.app" className="inline-block bg-rose-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-rose-600 transition">Email Support</a>
        </div>
      </div>
    </div>
  );
}
