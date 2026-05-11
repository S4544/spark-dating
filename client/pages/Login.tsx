import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Heart, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    finally { setLoading(false); }
  };

  return (
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
        </div>
      </div>
    </div>
  );
}
