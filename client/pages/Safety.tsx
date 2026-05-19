import { Link } from "react-router-dom";
export default function Safety() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-rose-500">🔥 Spark</Link>
        <Link to="/signup" className="bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold">Get Started</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Safety Tips</h1>
        <p className="text-gray-500 mb-10">Your safety is our top priority. Follow these guidelines to stay safe.</p>
        {[
          {icon:"🔒",title:"Protect Your Personal Info",tips:["Never share your home address, workplace, or financial info","Use Spark's in-app messaging before moving to other platforms","Be cautious about sharing personal social media handles early on"]},
          {icon:"📞",title:"When Chatting Online",tips:["Take your time getting to know someone before meeting","Trust your instincts — if something feels off, it probably is","Block and report anyone who makes you uncomfortable"]},
          {icon:"☕",title:"Meeting In Person",tips:["Always meet in a public place for the first few dates","Tell a friend or family member where you're going","Arrange your own transportation to and from the meeting place","Don't feel pressured to meet before you're ready"]},
          {icon:"🚨",title:"Report & Block",tips:["Use the report feature for any suspicious behavior","You can block anyone at any time from their profile","Reports are reviewed by our safety team within 24 hours","Your reports are kept confidential"]},
          {icon:"🆘",title:"Emergency Resources",tips:["In an emergency, always call 112 (India Emergency)","National Women's Helpline: 181","Cyber Crime Helpline: 1930","Spark Support: support@sparkdate.app"]},
        ].map(s=>(
          <div key={s.title} className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><span>{s.icon}</span>{s.title}</h2>
            <ul className="space-y-2">{s.tips.map(t=><li key={t} className="flex items-start gap-2 text-gray-600 text-sm"><span className="text-rose-500 mt-0.5">•</span>{t}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
}
