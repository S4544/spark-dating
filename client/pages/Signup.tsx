import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Multi-step form
  const [form, setForm] = useState({ name: "", email: "", password: "", age: "", agreedToTerms: false, agreedToPrivacy: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) { navigate("/discover"); return; }
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (step === 1) {
      if (!form.name || !form.email) { setError("Please fill all fields"); return; }
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreedToTerms || !form.agreedToPrivacy) { setError("Please agree to terms and privacy policy"); return; }
    if (parseInt(form.age) < 18) { setError("You must be 18 or older"); return; }
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: parseInt(form.age) }),
      });
      const d = await r.json();
      if (d.success) {
        localStorage.setItem("token", d.token);
        localStorage.setItem("userId", d.userId);
        await new Promise(res => setTimeout(res, 300));
        navigate("/profile");
      } else setError(d.message || "Signup failed");
    } catch { setError("Connection error. Is the server running?"); }
    finally { setLoading(false); }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (p.length === 0) return { score: 0, label: "", color: "" };
    if (p.length < 6) return { score: 1, label: "Weak", color: "bg-red-400" };
    if (p.length < 10 && !/[0-9]/.test(p)) return { score: 2, label: "Fair", color: "bg-yellow-400" };
    if (p.length >= 8 && /[0-9]/.test(p)) return { score: 3, label: "Strong", color: "bg-green-400" };
    return { score: 2, label: "Fair", color: "bg-yellow-400" };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "linear-gradient(135deg, #fff0f3 0%, #ffe4f0 50%, #ffd6e8 100%)" }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
        @keyframes slideRight { from{opacity:0;transform:translateX(-20px);} to{opacity:1;transform:translateX(0);} }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
        @keyframes checkPop { 0%{transform:scale(0);} 70%{transform:scale(1.2);} 100%{transform:scale(1);} }
        .slide-up { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .slide-right { animation: slideRight 0.4s ease forwards; }
        .float-anim { animation: float 3s ease-in-out infinite; }
        .check-pop { animation: checkPop 0.3s ease forwards; }
        .btn-press:active { transform: scale(0.97); }
      `}</style>

      {/* Left side */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#f43f5e 0%,#fb923c 100%)" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute text-white/10 text-7xl float-anim"
              style={{ left: `${10 + i * 16}%`, top: `${15 + (i % 3) * 25}%`, animationDelay: `${i * 0.5}s` }}>
              {["💕","🔥","✨","❤️","💫","🌟"][i]}
            </div>
          ))}
        </div>
        <div className="relative text-center text-white p-12">
          <div className="text-8xl mb-6 float-anim">💕</div>
          <h1 className="text-5xl font-black mb-4">Join Spark!</h1>
          <p className="text-white/80 text-xl max-w-sm mb-8">Create your profile and start finding real connections nearby</p>
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {["Free to join forever","GPS-based matching","Real people only","Safe & secure"].map((f, i) => (
              <div key={f} className="flex items-center gap-3 bg-white/15 backdrop-blur rounded-xl px-4 py-3"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <CheckCircle className="w-5 h-5 text-white flex-shrink-0"/>
                <span className="text-white font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Signup form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className={`w-full max-w-md transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)" }}>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>🔥</div>
              <span className="text-3xl font-black text-gray-900">Spark</span>
            </div>
            <p className="text-gray-500">Create your free account</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8" style={{ boxShadow: "0 25px 60px rgba(244,63,94,0.15)" }}>
            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-6">
              {[1, 2].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step >= s ? "text-white scale-110" : "bg-gray-100 text-gray-400"
                  }`} style={step >= s ? { background: "linear-gradient(135deg,#f43f5e,#fb923c)" } : {}}>
                    {step > s ? "✓" : s}
                  </div>
                  <span className={`text-sm font-medium ${step >= s ? "text-gray-900" : "text-gray-400"}`}>
                    {s === 1 ? "Basic Info" : "Password"}
                  </span>
                  {s < 2 && <div className={`flex-1 h-0.5 w-8 ${step > s ? "bg-rose-400" : "bg-gray-200"} transition-all`}/>}
                </div>
              ))}
            </div>

            <h1 className="text-2xl font-black text-gray-900 mb-1">
              {step === 1 ? "Who are you? 👋" : "Secure your account 🔐"}
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              {step === 1 ? "Tell us a bit about yourself" : "Choose a strong password"}
            </p>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="slide-up">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Full Name</Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Your name" required className="h-12 rounded-2xl border-gray-200 focus:border-rose-400"/>
                </div>
                <div className="slide-up" style={{ animationDelay: "0.1s" }}>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="you@example.com" required className="h-12 rounded-2xl border-gray-200 focus:border-rose-400"/>
                </div>
                <div className="slide-up" style={{ animationDelay: "0.2s" }}>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Age</Label>
                  <Input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})}
                    placeholder="Must be 18+" min="18" max="99" required className="h-12 rounded-2xl border-gray-200 focus:border-rose-400"/>
                </div>
                <Button type="submit" className="w-full h-12 font-bold rounded-2xl text-white btn-press"
                  style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
                  Continue →
                </Button>
              </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="slide-right">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Password</Label>
                  <div className="relative">
                    <Input type={showPass ? "text" : "password"} value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      placeholder="Min 6 characters" required className="h-12 rounded-2xl border-gray-200 focus:border-rose-400 pr-12"/>
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                  </div>
                  {/* Password strength */}
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : "bg-gray-200"}`}/>
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${strength.score === 3 ? "text-green-600" : strength.score === 2 ? "text-yellow-600" : "text-red-600"}`}>
                        {strength.label} password
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 slide-right" style={{ animationDelay: "0.1s" }}>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${form.agreedToTerms ? "border-rose-500 bg-rose-500" : "border-gray-300 group-hover:border-rose-400"}`}
                      onClick={() => setForm({...form, agreedToTerms: !form.agreedToTerms})}>
                      {form.agreedToTerms && <span className="text-white text-xs check-pop">✓</span>}
                    </div>
                    <span className="text-sm text-gray-600">
                      I agree to the{" "}
                      <Link to="/terms" target="_blank" className="text-rose-500 font-medium hover:underline">Terms of Service</Link>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${form.agreedToPrivacy ? "border-rose-500 bg-rose-500" : "border-gray-300 group-hover:border-rose-400"}`}
                      onClick={() => setForm({...form, agreedToPrivacy: !form.agreedToPrivacy})}>
                      {form.agreedToPrivacy && <span className="text-white text-xs check-pop">✓</span>}
                    </div>
                    <span className="text-sm text-gray-600">
                      I agree to the{" "}
                      <Link to="/privacy" target="_blank" className="text-rose-500 font-medium hover:underline">Privacy Policy</Link>
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 slide-right" style={{ animationDelay: "0.2s" }}>
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 h-12 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all btn-press">
                    ← Back
                  </button>
                  <Button type="submit" disabled={loading} className="flex-1 h-12 font-bold rounded-2xl text-white btn-press"
                    style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Creating...
                      </span>
                    ) : "Create Account 🔥"}
                  </Button>
                </div>
              </form>
            )}

            <p className="text-center text-gray-500 text-sm mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-rose-500 font-semibold hover:text-rose-600">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
