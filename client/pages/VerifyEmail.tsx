import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function VerifyEmail() {
  const [status, setStatus] = useState<"loading"|"success"|"error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // This page just shows a nice UI while server handles the redirect
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) { setStatus("error"); setMessage("Invalid verification link"); return; }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(r => r.text())
      .then(() => { setStatus("success"); setMessage("Email verified successfully!"); })
      .catch(() => { setStatus("error"); setMessage("Verification failed"); });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 p-4">
      <div className="bg-white rounded-3xl p-10 text-center shadow-xl max-w-md w-full">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500"/>
          <span className="text-2xl font-black">Spark</span>
        </div>
        {status === "loading" && <>
          <div className="text-5xl animate-spin mb-4">⏳</div>
          <p className="text-gray-600">Verifying your email...</p>
        </>}
        {status === "success" && <>
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Email Verified!</h2>
          <p className="text-gray-500 mb-6">You can now use all features of Spark.</p>
          <Link to="/discover" className="inline-block bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition">
            🔥 Start Discovering
          </Link>
        </>}
        {status === "error" && <>
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-500 mb-6">{message}</p>
          <Link to="/login" className="text-rose-500 font-semibold hover:text-rose-600">Back to Login →</Link>
        </>}
      </div>
    </div>
  );
}
