export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h1 className="text-4xl font-black text-gray-900 mb-8">Privacy Policy</h1>
          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">Data Collection</h2>
              <p>We collect information you provide directly to us, such as your profile information and messages.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">Data Protection</h2>
              <p>Your data is encrypted and protected using industry-standard security measures.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">Third-Party Sharing</h2>
              <p>We do not share your personal data with third parties without your consent.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
