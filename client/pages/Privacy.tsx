import { Link } from "react-router-dom";
export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-rose-500">🔥 Spark</Link>
        <Link to="/signup" className="bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-rose-600">Get Started</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-10">Last updated: January 1, 2024</p>
        {[
          ["Information We Collect", "We collect information you provide directly: name, email, age, photos, bio, gender preferences, and location. We also collect usage data such as swipes, matches, and messages to improve our service."],
          ["How We Use Your Information", "We use your information to provide and improve our matching service, send you notifications about matches and messages, ensure safety and security on our platform, and comply with legal obligations."],
          ["Location Data", "We use your location to show you profiles of people nearby. You can control location permissions through your device settings. We never share your exact location with other users — only approximate distance."],
          ["Data Sharing", "We do not sell your personal data to third parties. We may share data with trusted service providers who help us operate the platform, under strict confidentiality agreements. We may disclose data if required by law."],
          ["Data Security", "We use industry-standard encryption (SSL/TLS) to protect your data in transit and at rest. We regularly audit our security practices. However, no system is 100% secure — use a strong, unique password."],
          ["Data Retention", "We retain your account data for as long as your account is active. You can delete your account at any time from your profile settings, which will permanently remove your data within 30 days."],
          ["Your Rights", "You have the right to access, correct, or delete your personal data. You can export your data or request its deletion by contacting us at privacy@sparkdate.app."],
          ["Cookies", "We use cookies to keep you logged in and improve your experience. See our Cookie Policy for details. You can control cookies through your browser settings."],
          ["Children's Privacy", "Spark is strictly for users 18 and older. We do not knowingly collect data from anyone under 18. If we discover an underage account, we will immediately delete it."],
          ["Contact Us", "For privacy questions or requests, contact our Privacy Team at privacy@sparkdate.app or write to: Spark Dating App, Privacy Team, India."],
        ].map(([title, body]) => (
          <div key={title} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
            <p className="text-gray-600 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
