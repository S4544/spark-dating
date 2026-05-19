import { useEffect, useState } from "react";
import IntroAnimation, { useIntroSeen } from "@/components/IntroAnimation";
import { useNavigate, Link } from "react-router-dom";

function SparkLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff6b6b"/>
          <stop offset="100%" stopColor="#ee5a24"/>
        </linearGradient>
      </defs>
      <path d="M24 4 C24 4 33 15 33 23 C33 29 29 33 24 33 C19 33 15 29 15 23 C15 15 24 4 24 4Z" fill="url(#logoGrad)"/>
      <path d="M24 14 C24 14 29 21 29 25 C29 28 26.7 30 24 30 C21.3 30 19 28 19 25 C19 21 24 14 24 14Z" fill="#fff" fillOpacity="0.4"/>
      <circle cx="17" cy="41" r="4" fill="url(#logoGrad)"/>
      <circle cx="31" cy="41" r="4" fill="url(#logoGrad)"/>
      <line x1="21" y1="41" x2="27" y2="41" stroke="#ff6b6b" strokeWidth="2.5"/>
      <line x1="21" y1="33" x2="18" y2="37" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round"/>
      <line x1="27" y1="33" x2="30" y2="37" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const features = [
  { icon: "📍", title: "Find Nearby", desc: "Discover real people around you. Distance-based matching for meaningful local connections.", bg: "bg-rose-50", border: "border-rose-100" },
  { icon: "✨", title: "Smart Matching", desc: "Our algorithm connects you with people who share your interests, values and vibe.", bg: "bg-orange-50", border: "border-orange-100" },
  { icon: "💬", title: "Real Messages", desc: "Chat only with your mutual matches. No spam, no fake profiles, no bots.", bg: "bg-pink-50", border: "border-pink-100" },
  { icon: "🔒", title: "Safe & Secure", desc: "Your privacy is our priority. Encrypted data, verified profiles, full control.", bg: "bg-purple-50", border: "border-purple-100" },
  { icon: "❤️", title: "Like & Connect", desc: "Like profiles you're interested in. It's a match when they like you back!", bg: "bg-red-50", border: "border-red-100" },
  { icon: "🔞", title: "18+ Community", desc: "A safe space for adults only. Age-verified, respectful community guidelines.", bg: "bg-amber-50", border: "border-amber-100" },
];

const socialLinks = [
  { name: "Instagram", href: "https://www.instagram.com", svg: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
  { name: "TikTok", href: "https://www.tiktok.com", svg: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.56V6.79a4.85 4.85 0 01-1.07-.1z" },
  { name: "YouTube", href: "https://www.youtube.com", svg: "M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" },
  { name: "Twitter", href: "https://www.twitter.com", svg: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { name: "Facebook", href: "https://www.facebook.com", svg: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
];

export default function Index() {
  const [showIntro, setShowIntro] = useState(() => !useIntroSeen());
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/discover");
  }, [navigate]);

  if (showIntro) return <IntroAnimation onComplete={() => setShowIntro(false)} />;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparkLogo size={34} />
            <span className="text-2xl font-black text-gray-900" style={{letterSpacing:"-0.5px"}}>Spark</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-rose-500 transition-colors px-4 py-2">Log In</Link>
            <Link to="/signup" className="text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-orange-400 hover:opacity-90 px-5 py-2 rounded-full transition-all shadow-md">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-red-400 to-orange-400 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"/>
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"/>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              🔥 India's Fastest Growing Dating App
            </div>
            <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6">
              Find Your <br/><span className="text-yellow-300">Perfect</span> Match
            </h1>
            <p className="text-white/85 text-lg mb-10 max-w-md mx-auto lg:mx-0">
              Connect with real people nearby. Spark meaningful conversations and build genuine relationships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-white text-rose-500 font-bold text-lg px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-xl">
                🔥 Start for Free
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-bold text-lg px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
                Sign In
              </Link>
            </div>
            <p className="text-white/60 text-sm mt-6">Free to join · 18+ only · No credit card required</p>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-64 h-80">
              <div className="absolute top-4 left-4 w-52 h-72 bg-white/20 rounded-3xl rotate-6"/>
              <div className="absolute top-2 left-2 w-52 h-72 bg-white/30 rounded-3xl rotate-3"/>
              <div className="w-52 h-72 bg-white/90 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-3 p-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-orange-300 flex items-center justify-center text-4xl">👩</div>
                <p className="font-bold text-gray-800 text-lg">Priya, 24</p>
                <p className="text-gray-500 text-sm">📍 2.3 km away</p>
                <p className="text-gray-600 text-xs text-center italic">"Looking for genuine connections ✨"</p>
                <div className="flex gap-3 mt-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">✗</div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-xl">❤️</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-3 gap-6 text-center">
          {[{val:"50K+",label:"Active Users"},{val:"1M+",label:"Matches Made"},{val:"4.8★",label:"App Rating"}].map(s=>(
            <div key={s.label}>
              <div className="text-3xl font-black text-rose-500">{s.val}</div>
              <div className="text-gray-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY SPARK */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Why Choose Spark?</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">A dating app designed for genuine connections and meaningful relationships</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f=>(
            <div key={f.title} className={`${f.bg} border ${f.border} rounded-2xl p-6 hover:shadow-md transition-shadow`}>
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-rose-500 to-orange-400 text-white">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-4xl font-black mb-4">Ready to Find Your Spark?</h2>
          <p className="text-white/80 text-lg mb-8">Join thousands of people already making real connections</p>
          <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-rose-500 font-bold text-lg px-10 py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-xl">
            🔥 Create Free Account
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <SparkLogo size={30}/>
                <span className="text-white font-black text-xl">Spark</span>
              </div>
              <p className="text-sm leading-relaxed mb-5">Connecting real people, sparking real relationships. Made with ❤️ in India.</p>
              <div className="flex gap-3 flex-wrap">
                {socialLinks.map(s=>(
                  <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-gray-800 hover:bg-rose-500 flex items-center justify-center transition-colors" title={s.name}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-300"><path d={s.svg}/></svg>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/discover" className="hover:text-white transition-colors">Discover</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link to="/community-guidelines" className="hover:text-white transition-colors">Community Guidelines</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/safety" className="hover:text-white transition-colors">Safety Tips</Link></li>
                <li><a href="mailto:support@sparkdate.app" className="hover:text-white transition-colors">support@sparkdate.app</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2024 Spark Dating App. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
