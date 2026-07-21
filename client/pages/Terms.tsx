export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h1 className="text-4xl font-black text-gray-900 mb-8">Terms of Service</h1>
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">1. Acceptance of Terms</h2>
              <p>By using Spark Dating App, you agree to comply with these terms and conditions.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">2. User Eligibility</h2>
              <p>You must be at least 18 years old to use this service.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">3. User Conduct</h2>
              <p>Users agree not to engage in harassment, discrimination, or illegal activities.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">4. Content</h2>
              <p>Users are responsible for the content they post. We reserve the right to remove inappropriate content.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
