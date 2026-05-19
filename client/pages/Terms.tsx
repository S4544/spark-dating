import { Link } from "react-router-dom";
export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-rose-500">🔥 Spark</Link>
        <Link to="/signup" className="bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-rose-600">Get Started</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-10">Last updated: January 1, 2024</p>
        {[
          ["1. Acceptance of Terms", "By accessing or using Spark, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access or use our services."],
          ["2. Eligibility", "You must be at least 18 years of age to create an account and use Spark. By using our service, you represent and warrant that you are 18 or older. We may ask for proof of age at any time."],
          ["3. Account Responsibilities", "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access. You are responsible for all activities that occur under your account."],
          ["4. User Conduct", "You agree not to harass, abuse, or harm other users. You agree not to post false, misleading, or deceptive content. You agree not to use the service for any illegal or unauthorized purpose. Violation of these rules may result in account termination."],
          ["5. Privacy", "Your privacy is important to us. Please review our Privacy Policy, which governs your use of Spark and is incorporated into these Terms by reference."],
          ["6. Intellectual Property", "All content on Spark, including logos, text, graphics, and software, is owned by Spark Dating App and protected by intellectual property laws. You may not reproduce or distribute any content without our written permission."],
          ["7. Termination", "We reserve the right to suspend or terminate your account at any time for violations of these terms, without prior notice or liability."],
          ["8. Limitation of Liability", "Spark is provided on an 'as is' basis. We make no warranties, expressed or implied. In no event shall Spark be liable for any indirect, incidental, or consequential damages."],
          ["9. Changes to Terms", "We reserve the right to modify these terms at any time. We will notify users of significant changes via email or in-app notification. Continued use after changes constitutes acceptance."],
          ["10. Contact", "For questions about these Terms, contact us at legal@sparkdate.app"],
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
