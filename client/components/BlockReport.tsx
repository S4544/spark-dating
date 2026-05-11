import { useState } from "react";
import { Flag, Ban, X } from "lucide-react";

interface Props {
  userId: string;
  userName: string;
  onBlock?: () => void;
}

export default function BlockReport({ userId, userName, onBlock }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu"|"report">("menu");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");

  const token = () => localStorage.getItem("token") || "";

  const handleBlock = async () => {
    if (!confirm(`Block ${userName}? They won't be able to see your profile.`)) return;
    setLoading(true);
    try {
      await fetch(`/api/block/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      setDone("blocked");
      setOpen(false);
      onBlock?.();
    } catch {}
    finally { setLoading(false); }
  };

  const handleReport = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await fetch(`/api/report/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      setDone("reported");
      setOpen(false);
    } catch {}
    finally { setLoading(false); }
  };

  if (done === "blocked") return <span className="text-xs text-gray-400">Blocked</span>;
  if (done === "reported") return <span className="text-xs text-green-500">✓ Reported</span>;

  return (
    <>
      <button onClick={() => { setOpen(true); setMode("menu"); }}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition" title="Block or Report">
        <Flag className="w-4 h-4"/>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black text-gray-900">
                {mode === "menu" ? `⚠️ ${userName}` : "📋 Report User"}
              </h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5"/>
              </button>
            </div>

            {mode === "menu" ? (
              <div className="space-y-3">
                <button onClick={handleBlock} disabled={loading}
                  className="w-full flex items-center gap-3 p-4 border-2 border-red-100 hover:border-red-300 rounded-2xl text-left transition">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Ban className="w-5 h-5 text-red-500"/>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Block {userName}</p>
                    <p className="text-gray-500 text-xs">They won't see your profile anymore</p>
                  </div>
                </button>
                <button onClick={() => setMode("report")}
                  className="w-full flex items-center gap-3 p-4 border-2 border-orange-100 hover:border-orange-300 rounded-2xl text-left transition">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Flag className="w-5 h-5 text-orange-500"/>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Report {userName}</p>
                    <p className="text-gray-500 text-xs">Report fake profile or inappropriate content</p>
                  </div>
                </button>
                <button onClick={() => setOpen(false)}
                  className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition text-sm">
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-sm mb-4">What's the issue with this profile?</p>
                <div className="space-y-2 mb-4">
                  {["Fake profile / Catfish", "Inappropriate photos", "Harassment or spam", "Underage user", "Other"].map(r => (
                    <button key={r} onClick={() => setReason(r)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition ${
                        reason === r ? "border-rose-500 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setMode("menu")} className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition text-sm">
                    Back
                  </button>
                  <button onClick={handleReport} disabled={!reason || loading}
                    className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition disabled:opacity-50 text-sm">
                    {loading ? "Sending..." : "Submit Report"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
