import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import Header from "@/components/layout/Header";

export default function Likes() {
  const navigate = useNavigate();
  const [likers, setLikers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchLikers();
  }, []);

  const fetchLikers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const r = await fetch("/api/likes/received", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) setLikers(d.users);
    } catch {}
    finally { setLoading(false); }
  };

  const handleLikeBack = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/interactions/like", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: userId }),
      });
      // Remove from list after liking back
      setLikers(prev => prev.filter(u => u.id !== userId));
    } catch {}
  };

  const handlePass = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/interactions/pass", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: userId }),
      });
      setLikers(prev => prev.filter(u => u.id !== userId));
    } catch {}
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500"/>
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Who Liked You ❤️</h1>
            <p className="text-gray-500 text-sm">{likers.length} people liked your profile</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl animate-pulse mb-3">❤️</div>
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : likers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">💫</div>
            <h2 className="text-xl font-black text-gray-900 mb-2">No likes yet</h2>
            <p className="text-gray-500 text-sm mb-6">Complete your profile and start discovering to get more likes!</p>
            <button onClick={() => navigate("/discover")}
              className="bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition">
              Start Discovering 🔥
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {likers.map(user => {
              const avatar = user.photos?.[0] ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f43f5e&color=fff&bold=true`;
              return (
                <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                  <div className="relative h-52">
                    <img src={avatar} alt={user.name} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }}/>
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <p className="font-black text-lg">{user.name}, {user.age}</p>
                      {user.bio && <p className="text-white/80 text-xs line-clamp-1">{user.bio}</p>}
                    </div>
                    <div className="absolute top-3 right-3 bg-rose-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      ❤️ Liked you {timeAgo(user.liked_at)}
                    </div>
                  </div>
                  <div className="p-3 flex gap-2">
                    <button onClick={() => handlePass(user.id)}
                      className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-300 transition text-sm">
                      ✗ Pass
                    </button>
                    <button onClick={() => handleLikeBack(user.id)}
                      className="flex-1 py-2.5 text-white font-semibold rounded-xl hover:opacity-90 transition text-sm"
                      style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
                      ❤️ Like Back
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
