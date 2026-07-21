export default function CommunityGuidelines() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h1 className="text-4xl font-black text-gray-900 mb-8">Community Guidelines</h1>
          <div className="space-y-6 text-gray-700">
            {[
              { title: "Be Respectful", desc: "Treat all members with respect and kindness." },
              { title: "No Harassment", desc: "Harassment, bullying, or discrimination is not tolerated." },
              { title: "No Spam", desc: "Don't send unsolicited messages or promotional content." },
              { title: "Authentic Profiles", desc: "Use real photos and genuine information about yourself." },
              { title: "Report Issues", desc: "Use our report feature to flag inappropriate behavior." },
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
