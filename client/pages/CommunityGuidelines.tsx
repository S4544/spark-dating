import { Link } from "react-router-dom";
export default function CommunityGuidelines() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-rose-500">🔥 Spark</Link>
        <Link to="/signup" className="bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold">Get Started</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Community Guidelines</h1>
        <p className="text-gray-500 mb-10">Spark is built on respect. These guidelines keep our community safe and welcoming for everyone.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {[{icon:"✅",label:"Be Yourself",desc:"Use real photos and honest information"},{icon:"🤝",label:"Be Respectful",desc:"Treat everyone with dignity and kindness"},{icon:"🚫",label:"No Harassment",desc:"Zero tolerance for bullying or hate speech"},{icon:"🔞",label:"18+ Only",desc:"This platform is for adults only"}].map(r=>(
            <div key={r.label} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="text-3xl mb-2">{r.icon}</div>
              <p className="font-bold text-gray-900">{r.label}</p>
              <p className="text-gray-500 text-sm">{r.desc}</p>
            </div>
          ))}
        </div>
        {[
          ["❌ What's Not Allowed",["Fake profiles or impersonation","Harassment, threats, or hate speech","Explicit or inappropriate content in public profile","Solicitation, spam, or scamming","Sharing another user's private information","Any illegal activity"]],
          ["✅ What We Encourage",["Honest, authentic profiles","Respectful conversations","Reporting suspicious behavior","Blocking anyone who makes you uncomfortable","Meeting safely in public places"]],
          ["⚠️ Consequences",["Violations result in warnings, temporary suspension, or permanent ban","Severe violations are reported to authorities","We cooperate fully with law enforcement when required"]],
        ].map(([title, items])=>(
          <div key={String(title)} className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
            <ul className="space-y-2">{(items as string[]).map(i=><li key={i} className="flex items-start gap-2 text-gray-600 text-sm"><span className="text-rose-500 mt-0.5">•</span>{i}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
}
