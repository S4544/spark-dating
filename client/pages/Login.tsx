<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState } from "react";
>>>>>>> 32f654e9db67216fc8116647f377357d85be97d1
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { Eye, EyeOff } from "lucide-react";
=======
import { Heart, Eye, EyeOff } from "lucide-react";
>>>>>>> 32f654e9db67216fc8116647f377357d85be97d1

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
<<<<<<< HEAD
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("token");
    if (token) { navigate("/discover"); return; }
    setTimeout(() => setMounted(true), 50);
  }, []);
=======
>>>>>>> 32f654e9db67216fc8116647f377357d85be97d1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.success) {
        localStorage.setItem("token", d.token);
        localStorage.setItem("userId", d.userId);
<<<<<<< HEAD
        // Smooth transition before navigate
        await new Promise(res => setTimeout(res, 300));
        navigate("/discover");
      } else setError(d.message || "Login failed");
    } catch { setError("Connection error. Is the server running?"); }
=======
        navigate("/discover");
      } else setError(d.message || "Login failed");
    } catch { setError("An error occurred. Please try again."); }
    finally { setLoading(false); }
  };

  const handleDemo = async () => {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/auth/demo", { method: "POST" });
      const d = await r.json();
      if (d.success) {
        localStorage.setItem("token", d.token);
        localStorage.setItem("userId", d.userId);
        navigate("/discover");
      }
    } catch { setError("Demo login failed"); }
>>>>>>> 32f654e9db67216fc8116647f377357d85be97d1
    finally { setLoading(false); }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex overflow-hidden" style={{ background: "linear-gradient(135deg, #fff0f3 0%, #ffe4f0 50%, #ffd6e8 100%)" }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-15px) rotate(5deg);} }
        @keyframes pulse-ring { 0%{transform:scale(0.95);box-shadow:0 0 0 0 rgba(244,63,94,0.4);} 70%{transform:scale(1);box-shadow:0 0 0 15px rgba(244,63,94,0);} 100%{transform:scale(0.95);} }
        @keyframes shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
        .slide-up { animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-in { animation: fadeIn 0.8s ease forwards; }
        .float-anim { animation: float 4s ease-in-out infinite; }
        .input-focus:focus { transform: scale(1.01); }
        .btn-press:active { transform: scale(0.97); }
      `}</style>

      {/* Left decorative side - hidden on mobile */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#f43f5e 0%,#fb923c 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          {["10%,15%","20%,70%","70%,20%","80%,75%","50%,50%"].map((pos, i) => (
            <div key={i} className="absolute text-white/10 text-8xl font-black float-anim"
              style={{ left: pos.split(",")[0], top: pos.split(",")[1], animationDelay: `${i * 0.7}s` }}>
              {["❤️","✨","🔥","💫","💕"][i]}
            </div>
          ))}
        </div>
        <div className="relative text-center text-white p-12">
          <div className="text-8xl mb-6 float-anim">🔥</div>
          <h1 className="text-5xl font-black mb-4">Welcome Back!</h1>
          <p className="text-white/80 text-xl max-w-sm">Your perfect match is waiting for you</p>
          <div className="mt-10 flex justify-center gap-4">
            {["50K+ Users","1M+ Matches","4.8★ Rating"].map(s => (
              <div key={s} className="bg-white/20 backdrop-blur rounded-2xl px-4 py-3 text-center">
                <p className="text-white font-black text-sm">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className={`w-full max-w-md transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)" }}>

          {/* Logo */}
          <div className="text-center mb-8 slide-up">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
                🔥
              </div>
              <span className="text-3xl font-black text-gray-900">Spark</span>
            </div>
            <p className="text-gray-500">Find your perfect match nearby</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8" style={{ boxShadow: "0 25px 60px rgba(244,63,94,0.15)" }}>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Sign In</h1>
            <p className="text-gray-500 text-sm mb-6">Good to see you again! ✨</p>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="slide-up" style={{ animationDelay: "0.1s" }}>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</Label>
                <Input type="email" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="you@example.com" required
                  className="h-12 rounded-2xl border-gray-200 focus:border-rose-400 focus:ring-rose-300 transition-all input-focus"/>
              </div>

              <div className="slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold text-gray-700">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input type={showPass ? "text" : "password"} value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    placeholder="Your password" required
                    className="h-12 rounded-2xl border-gray-200 focus:border-rose-400 focus:ring-rose-300 pr-12 transition-all input-focus"/>
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPass ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                  </button>
                </div>
              </div>

              <div className="slide-up" style={{ animationDelay: "0.3s" }}>
                <Button type="submit" disabled={loading}
                  className="w-full h-12 font-bold rounded-2xl text-white text-base transition-all btn-press relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Signing in...
                    </span>
                  ) : "Sign In 🔥"}
                </Button>
              </div>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-rose-500 font-semibold hover:text-rose-600 transition-colors">
                Sign up free →
              </Link>
            </p>
          </div>
=======
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center gap-2 mb-8">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500"/>
            <span className="text-2xl font-black text-gray-900">Spark</span>
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 mb-8">Sign in to find your spark ✨</p>

          {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1">Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required className="h-12 rounded-xl"/>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-sm font-semibold text-gray-700">Password</Label>
                <Link to="/forgot-password" className="text-xs text-rose-500 hover:text-rose-600 font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Your password" required className="h-12 rounded-xl pr-12"/>
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 font-bold rounded-xl text-white text-base" style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
              {loading ? "Signing in..." : "Sign In 🔥"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"/></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-3 text-gray-400">or</span></div>
          </div>

          <button onClick={handleDemo} disabled={loading} className="w-full h-12 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
            👤 Try Demo Account
          </button>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-rose-500 font-semibold hover:text-rose-600">Sign up free</Link>
          </p>
>>>>>>> 32f654e9db67216fc8116647f377357d85be97d1
        </div>
      </div>
    </div>
  );
}
