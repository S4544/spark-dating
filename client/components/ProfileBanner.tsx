import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, AlertCircle } from "lucide-react";

export default function ProfileBanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    // Only show on discover page
    if (location.pathname !== "/discover") return;
    if (dismissed) return;
    if (sessionStorage.getItem("banner-dismissed")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Check profile completion
    fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (!d.success || !d.profile) return;
        const p = d.profile;
        const fields = [p.name, p.age, p.bio, p.gender, p.interestedIn, p.photos?.length > 0];
        const pct = Math.round((fields.filter(Boolean).length / fields.length) * 100);
        setCompletion(pct);
        // Show banner if profile less than 80% complete
        if (pct < 80) setTimeout(() => setShow(true), 2000);
      })
      .catch(() => {});
  }, [location.pathname]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem("banner-dismissed", "1");
  };

  if (!show) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-40 max-w-lg mx-auto">
      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-20px);} to{opacity:1;transform:translateY(0);} }
        .slide-down { animation: slideDown 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>
      <div className="slide-down bg-white rounded-2xl shadow-xl border border-rose-100 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-rose-500"/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">
            Your profile is {completion}% complete
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            Complete it to get <span className="text-rose-500 font-semibold">3x more matches!</span>
          </p>
          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full transition-all"
              style={{ width: `${completion}%`, background: "linear-gradient(90deg,#f43f5e,#fb923c)" }}/>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => navigate("/profile")}
            className="px-3 py-2 text-white text-xs font-bold rounded-xl"
            style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
            Complete
          </button>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>
  );
}
