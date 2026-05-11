import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      if (d.success) setSent(true);
      else setError(d.message || "Something went wrong");
    } catch { setError("An error occurred. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-2 mb-8">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500"/>
          <span className="text-2xl font-black text-gray-900">Spark</span>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-500"/>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Check your email!</h2>
            <p className="text-gray-500 mb-2">We sent a password reset link to:</p>
            <p className="font-bold text-gray-800 mb-6">{email}</p>
            <p className="text-gray-400 text-sm mb-8">Didn't receive it? Check your spam folder or try again.</p>
            <Link to="/login" className="inline-flex items-center gap-2 text-rose-500 font-semibold hover:text-rose-600">
              <ArrowLeft className="w-4 h-4"/> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Forgot Password?</h1>
            <p className="text-gray-500 mb-8">Enter your email and we'll send you a reset link.</p>

            {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1">Email Address</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="h-12 rounded-xl"/>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 font-bold rounded-xl text-white" style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
                {loading ? "Sending..." : "Send Reset Link 📧"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
                <ArrowLeft className="w-4 h-4"/> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
