import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Heart, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const d = await r.json();
      if (d.success) { setSuccess(true); setTimeout(() => navigate("/login"), 2500); }
      else setError(d.message || "Reset failed");
    } catch { setError("An error occurred"); }
    finally { setLoading(false); }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 p-4">
      <div className="bg-white rounded-3xl p-8 text-center shadow-xl max-w-md w-full">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Invalid Link</h2>
        <p className="text-gray-500 mb-6">This reset link is invalid or has expired.</p>
        <Link to="/forgot-password" className="text-rose-500 font-semibold hover:text-rose-600">Request a new one →</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-2 mb-8">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500"/>
          <span className="text-2xl font-black text-gray-900">Spark</span>
        </div>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Password Reset! 🎉</h2>
            <p className="text-gray-500">Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-black text-gray-900 mb-2">New Password</h1>
            <p className="text-gray-500 mb-8">Choose a strong password for your account.</p>

            {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1">New Password</Label>
                <div className="relative">
                  <Input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required className="h-12 rounded-xl pr-12"/>
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1">Confirm Password</Label>
                <Input type={showPass ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required className="h-12 rounded-xl"/>
              </div>

              {/* Password strength */}
              {password && (
                <div className="space-y-1">
                  {[
                    { label: "At least 6 characters", ok: password.length >= 6 },
                    { label: "Contains a number", ok: /\d/.test(password) },
                    { label: "Passwords match", ok: password === confirm && confirm.length > 0 },
                  ].map(r => (
                    <div key={r.label} className={`flex items-center gap-2 text-xs ${r.ok ? "text-green-600" : "text-gray-400"}`}>
                      <span>{r.ok ? "✅" : "○"}</span> {r.label}
                    </div>
                  ))}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-12 font-bold rounded-xl text-white" style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
                {loading ? "Resetting..." : "Reset Password 🔑"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
