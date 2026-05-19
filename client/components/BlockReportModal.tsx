import { useState } from "react";
import { Flag, Ban, X } from "lucide-react";

interface Props {
  userId: string;
  userName: string;
  onClose: () => void;
  onBlocked: () => void;
}

export default function BlockReportModal({ userId, userName, onClose, onBlocked }: Props) {
  const [step, setStep] = useState<"menu" | "report" | "done">("menu");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const token = () => localStorage.getItem("token") || "";

  const handleBlock = async () => {
    setLoading(true);
    try {
      await fetch(`/api/block/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
      });
      onBlocked();
      onClose();
    } catch {}
    finally { setLoading(false); }
  };

  const handleReport = async () => {
    setLoading(true);
    try {
      await fetch(`/api/report/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      setStep("done");
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>

        {step === "menu" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-gray-900">{userName}</h3>
              <button onClick={onClose}><X className="w-5 h-5 text-gray-400"/></button>
            </div>
            <div className="space-y-2">
              <button onClick={() => setStep("report")}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:bg-orange-50 hover:border-orange-200 transition text-left">
                <Flag className="w-5 h-5 text-orange-500"/>
                <div>
                  <p className="font-semibold text-gray-900">Report {userName}</p>
                  <p className="text-gray-500 text-xs">Let us know if something is wrong</p>
                </div>
              </button>
              <button onClick={handleBlock} disabled={loading}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:bg-red-50 hover:border-red-200 transition text-left">
                <Ban className="w-5 h-5 text-red-500"/>
                <div>
                  <p className="font-semibold text-gray-900">Block {userName}</p>
                  <p className="text-gray-500 text-xs">They won't appear in your feed anymore</p>
                </div>
              </button>
            </div>
            <button onClick={onClose} className="w-full mt-4 py-3 text-gray-500 text-sm font-medium hover:text-gray-700">Cancel</button>
          </>
        )}

        {step === "report" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-gray-900">Report {userName}</h3>
              <button onClick={onClose}><X className="w-5 h-5 text-gray-400"/></button>
            </div>
            <p className="text-gray-500 text-sm mb-4">Why are you reporting this profile?</p>
            <div className="space-y-2 mb-4">
              {["Fake profile", "Inappropriate photos", "Harassment", "Spam", "Underage", "Other"].map(r => (
                <button key={r} onClick={() => setReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition ${
                    reason === r ? "border-rose-500 bg-rose-50 text-rose-600" : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}>
                  {r}
                </button>
              ))}
            </div>
            <button onClick={handleReport} disabled={!reason || loading}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </>
        )}

        {step === "done" && (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Report Submitted</h3>
            <p className="text-gray-500 text-sm mb-5">Thanks for keeping Spark safe. We'll review this profile within 24 hours.</p>
            <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-white"
              style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
