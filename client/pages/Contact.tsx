import { Link } from "react-router-dom";
import { useState } from "react";
export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-rose-500">🔥 Spark</Link>
        <Link to="/signup" className="bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold">Get Started</Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-14">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-10">We'd love to hear from you. Our team responds within 24 hours.</p>
        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h2>
            <p className="text-gray-600">We'll get back to you at your email within 24 hours.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="space-y-5">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label><input className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="Rahul Kumar"/></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label><input type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="you@example.com"/></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300">
                  <option>General Question</option><option>Report a User</option><option>Account Issue</option><option>Privacy Request</option><option>Other</option>
                </select>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Message</label><textarea rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="Tell us how we can help..."/></div>
              <button onClick={()=>setSent(true)} className="w-full bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold py-3 rounded-xl hover:opacity-90 transition">Send Message</button>
            </div>
          </div>
        )}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[{icon:"📧",title:"Email",val:"support@sparkdate.app"},{icon:"⏰",title:"Response Time",val:"Within 24 hours"}].map(c=>(
            <div key={c.title} className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">{c.icon}</div>
              <p className="font-semibold text-gray-900">{c.title}</p>
              <p className="text-gray-500 text-sm">{c.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
