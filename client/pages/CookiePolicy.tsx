import { Link } from "react-router-dom";
export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-rose-500">🔥 Spark</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-gray-500 mb-10">Last updated: January 1, 2024</p>
        {[
          ["What Are Cookies?","Cookies are small text files stored on your device when you visit Spark. They help us remember your preferences and improve your experience."],
          ["Essential Cookies","These are required for the app to function. They keep you logged in and remember your session. You cannot disable these without affecting app functionality."],
          ["Analytics Cookies","We use analytics to understand how users interact with Spark — which features are popular, how long sessions last, and where errors occur. This helps us improve the app."],
          ["Preference Cookies","These remember your settings, such as notification preferences and display options, so you don't have to set them every visit."],
          ["Managing Cookies","You can control cookies through your browser settings. Disabling cookies may affect some features of Spark. Most browsers allow you to refuse new cookies or delete existing ones."],
          ["Contact","For cookie-related questions, email us at privacy@sparkdate.app"],
        ].map(([title,body])=>(
          <div key={title} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
            <p className="text-gray-600 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
