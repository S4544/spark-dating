export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h1 className="text-4xl font-black text-gray-900 mb-8">Cookie Policy</h1>
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">What are Cookies?</h2>
              <p>Cookies are small data files stored on your device to enhance your browsing experience.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">How We Use Cookies</h2>
              <p>We use cookies for authentication, preferences, and analytics to improve our service.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
