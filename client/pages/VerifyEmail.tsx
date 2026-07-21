import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Placeholder - actual implementation would verify the code
      setTimeout(() => {
        navigate("/discover");
      }, 1000);
    } catch (e) {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✉️</div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">Enter the code sent to your email</p>
        </div>

        <form onSubmit={handleVerify} className="bg-white rounded-3xl shadow-lg p-8 space-y-4">
          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
          
          <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="000000" maxLength={6} className="w-full text-3xl text-center tracking-widest px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none" />
          
          <button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold rounded-2xl hover:opacity-90 transition">
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      </div>
    </div>
  );
}
