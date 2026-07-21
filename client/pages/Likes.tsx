import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Heart } from "lucide-react";

export default function Likes() {
  const navigate = useNavigate();
  const [likes, setLikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      const token = localStorage.getItem("token");
      const r = await fetch("/api/matches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) {
        setLikes(d.matches);
      }
    } catch (e) {
      console.error("Error fetching likes", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center"><div className="text-5xl animate-bounce mb-3">💕</div><p className="text-gray-600">Loading matches...</p></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black text-gray-900 mb-8">💕 Your Matches</h1>
        
        {likes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-xl text-gray-600">No matches yet. Keep swiping!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likes.map((like) => (
              <div key={like.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="relative h-64 bg-gray-200">
                  {like.photos?.[0] ? (
                    <img src={like.photos[0]} alt={like.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-400 to-orange-300">
                      <span className="text-6xl">👤</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-black text-gray-900">{like.name}, {like.age}</h3>
                  {like.bio && <p className="text-gray-600 text-sm mt-2 line-clamp-2">{like.bio}</p>}
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => navigate("/messages")} className="flex-1 py-2 bg-gradient-to-r from-rose-500 to-orange-400 text-white font-semibold rounded-lg hover:opacity-90 flex items-center justify-center gap-2">
                      💬 Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
