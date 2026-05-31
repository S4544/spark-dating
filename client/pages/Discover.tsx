import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, X, MapPin, MessageCircle, Star } from "lucide-react";
import { UserProfile } from "@shared/api";
import Header from "@/components/layout/Header";
import { useRealLocation } from "@/hooks/useLocation";
import FilterPanel from "@/components/FilterPanel";
import BlockReport from "@/components/BlockReport";
import Notifications from "@/components/Notifications";

interface Filters {
  minAge: number;
  maxAge: number;
  maxDistance: number;
  gender: string;
}

const defaultFilters: Filters = { minAge: 18, maxAge: 50, maxDistance: 50, gender: "all" };

function MatchModal({ profile, onClose, onMessage }: { profile: any; onClose: () => void; onMessage: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }}>
      <style>{`
        @keyframes matchPop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes heartRain { 0%{transform:translateY(-20px) scale(0);opacity:1} 100%{transform:translateY(120px) scale(1);opacity:0} }
        .match-pop { animation: matchPop 0.5s cubic-bezier(.36,.07,.19,.97) forwards; }
      `}</style>
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{ position:"fixed", left:`${8+i*8}%`, top:"-20px", fontSize:`${16+(i%3)*10}px`, animation:`heartRain ${1.5+(i%4)*0.4}s ease ${i*0.15}s infinite`, zIndex:51 }}>❤️</div>
      ))}
      <div className="match-pop bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative z-52">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-3xl font-black text-transparent bg-clip-text" style={{ backgroundImage:"linear-gradient(135deg,#f43f5e,#fb923c)" }}>It's a Match!</h2>
        <p className="text-gray-500 mt-2 mb-6">You and <strong>{profile.name}</strong> liked each other!</p>
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-rose-400">
            <img src={profile.photos?.[0] || `https://ui-avatars.com/api/?name=${profile.name}&background=f43f5e&color=fff`} alt={profile.name} className="w-full h-full object-cover"/>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition">Keep Swiping</button>
          <button onClick={onMessage} className="flex-1 py-3 text-white font-semibold rounded-2xl hover:opacity-90 transition flex items-center justify-center gap-2" style={{ background:"linear-gradient(135deg,#f43f5e,#fb923c)" }}>
            <MessageCircle className="w-4 h-4"/> Message
          </button>
        </div>
      </div>
    </div>
  );
}

function SwipeCard({ profile, onLike, onPass, isTop }: { profile: any; onLike: () => void; onPass: () => void; isTop: boolean }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const handleDragStart = (clientX: number) => {
    if (!isTop) return;
    isDragging.current = true;
    startX.current = clientX;
  };
  const handleDragMove = (clientX: number) => {
    if (!isDragging.current || !cardRef.current) return;
    currentX.current = clientX - startX.current;
    const rotate = currentX.current * 0.08;
    cardRef.current.style.transform = `translateX(${currentX.current}px) rotate(${rotate}deg)`;
    cardRef.current.style.transition = "none";
    const likeEl = cardRef.current.querySelector(".swipe-like") as HTMLElement;
    const passEl = cardRef.current.querySelector(".swipe-pass") as HTMLElement;
    if (likeEl) likeEl.style.opacity = Math.min(currentX.current / 80, 1).toString();
    if (passEl) passEl.style.opacity = Math.min(-currentX.current / 80, 1).toString();
  };
  const handleDragEnd = () => {
    if (!isDragging.current || !cardRef.current) return;
    isDragging.current = false;
    const threshold = 80;
    if (currentX.current > threshold) {
      cardRef.current.style.transition = "transform 0.3s ease";
      cardRef.current.style.transform = "translateX(150%) rotate(20deg)";
      setTimeout(onLike, 300);
    } else if (currentX.current < -threshold) {
      cardRef.current.style.transition = "transform 0.3s ease";
      cardRef.current.style.transform = "translateX(-150%) rotate(-20deg)";
      setTimeout(onPass, 300);
    } else {
      cardRef.current.style.transition = "transform 0.3s ease";
      cardRef.current.style.transform = "translateX(0) rotate(0deg)";
      const likeEl = cardRef.current.querySelector(".swipe-like") as HTMLElement;
      const passEl = cardRef.current.querySelector(".swipe-pass") as HTMLElement;
      if (likeEl) likeEl.style.opacity = "0";
      if (passEl) passEl.style.opacity = "0";
    }
    currentX.current = 0;
  };

  const photos = profile.photos?.length ? profile.photos : [`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=400&background=f43f5e&color=fff&bold=true`];

  return (
    <div ref={cardRef}
      className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction:"none", willChange:"transform" }}
      onMouseDown={e => handleDragStart(e.clientX)}
      onMouseMove={e => handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={e => handleDragStart(e.touches[0].clientX)}
      onTouchMove={e => { e.preventDefault(); handleDragMove(e.touches[0].clientX); }}
      onTouchEnd={handleDragEnd}>
      <div className="absolute inset-0">
        <img src={photos[photoIdx]} alt={profile.name} className="w-full h-full object-cover pointer-events-none" draggable={false}/>
        <div className="absolute inset-0" style={{ background:"linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)" }}/>
      </div>
      <div className="absolute inset-0 flex" style={{ zIndex:2 }}>
        <div className="flex-1" onClick={() => setPhotoIdx(Math.max(0, photoIdx-1))}/>
        <div className="flex-1" onClick={() => setPhotoIdx(Math.min(photos.length-1, photoIdx+1))}/>
      </div>
      {photos.length > 1 && (
        <div className="absolute top-3 left-0 right-0 flex gap-1 px-3" style={{ zIndex:3 }}>
          {photos.map((_: any, i: number) => (
            <div key={i} className="flex-1 h-1 rounded-full transition-all" style={{ background: i===photoIdx ? "white" : "rgba(255,255,255,0.4)" }}/>
          ))}
        </div>
      )}
      <div className="swipe-like absolute top-8 left-8 border-4 border-green-400 text-green-400 px-4 py-2 rounded-xl font-black text-2xl rotate-[-15deg] pointer-events-none" style={{ opacity:0, zIndex:4 }}>LIKE ❤️</div>
      <div className="swipe-pass absolute top-8 right-8 border-4 border-red-400 text-red-400 px-4 py-2 rounded-xl font-black text-2xl rotate-[15deg] pointer-events-none" style={{ opacity:0, zIndex:4 }}>NOPE ✗</div>

      {/* Block/Report button */}
      <div className="absolute top-3 right-3" style={{ zIndex:5 }} onClick={e => e.stopPropagation()}>
        <BlockReport userId={profile.id} userName={profile.name}/>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 text-white" style={{ zIndex:3 }}>
        <div className="flex items-end justify-between mb-1">
          <h2 className="text-3xl font-black">{profile.name}, {profile.age}</h2>
          <div className="bg-white/20 backdrop-blur rounded-full px-2 py-1">
            <span className="text-white font-bold text-xs">{Math.round(profile.distance||0)}km</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-white/80 text-sm mb-2">
          <MapPin className="w-3 h-3"/><span>{(profile.distance||0).toFixed(1)} km away</span>
        </div>
        {profile.bio && <p className="text-white/90 text-sm line-clamp-2">{profile.bio}</p>}
      </div>
    </div>
  );
}

export default function Discover() {
  const navigate = useNavigate();
  useRealLocation();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchProfile, setMatchProfile] = useState<any>(null);
  const [likeAnim, setLikeAnim] = useState(false);
  const [passAnim, setPassAnim] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchProfiles(filters);
  }, []);

  const fetchProfiles = async (f: Filters) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        minAge: f.minAge.toString(),
        maxAge: f.maxAge.toString(),
        maxDistance: f.maxDistance.toString(),
        gender: f.gender,
      });
      const r = await fetch(`/api/discover/filtered?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) { setProfiles(d.users || []); setCurrentIndex(0); }
    } catch {}
    finally { setLoading(false); }
  };

  const handleFilterChange = (f: Filters) => {
    setFilters(f);
    fetchProfiles(f);
  };

  const checkMatch = async (likedId: string) => {
    try {
      const token = localStorage.getItem("token");
      const r = await fetch("/api/matches", { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (d.success) {
        const match = d.matches.find((m: any) => m.id === likedId);
        if (match) setMatchProfile(match);
      }
    } catch {}
  };

  const handleLike = async () => {
    const profile = profiles[currentIndex];
    if (!profile) return;
    setLikeAnim(true); setTimeout(() => setLikeAnim(false), 600);
    try {
      const token = localStorage.getItem("token");
      const r = await fetch("/api/interactions/like", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: profile.id }),
      });
      const d = await r.json();
      if (d.isMatch) setMatchProfile(profile);
    } catch {}
    setCurrentIndex(i => i+1);
  };

  const handlePass = async () => {
    const profile = profiles[currentIndex];
    if (!profile) return;
    setPassAnim(true); setTimeout(() => setPassAnim(false), 600);
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/interactions/pass", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: profile.id }),
      });
    } catch {}
    setCurrentIndex(i => i+1);
  };

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex+1];

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Header/>
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center"><div className="text-5xl animate-bounce mb-3">🔥</div><p className="text-gray-600 font-medium">Finding people near you...</p></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      <Notifications/>
      <Header/>
      <style>{`
        @keyframes likeFlash { 0%,100%{opacity:0} 50%{opacity:1} }
        @keyframes passFlash { 0%,100%{opacity:0} 50%{opacity:1} }
        .like-flash { animation: likeFlash 0.5s ease forwards; }
        .pass-flash { animation: passFlash 0.5s ease forwards; }
      `}</style>
      {likeAnim && <div className="like-flash fixed inset-0 bg-green-400/20 pointer-events-none z-40"/>}
      {passAnim && <div className="pass-flash fixed inset-0 bg-red-400/20 pointer-events-none z-40"/>}
      {matchProfile && <MatchModal profile={matchProfile} onClose={() => setMatchProfile(null)} onMessage={() => { setMatchProfile(null); navigate("/messages"); }}/>}

      <div className="container mx-auto px-4 py-4 max-w-sm">
        {/* Filter bar */}
        <div className="flex justify-center mb-4">
          <FilterPanel filters={filters} onChange={handleFilterChange}/>
        </div>

        {!currentProfile ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <div className="text-6xl mb-4">💫</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No more profiles!</h3>
            <p className="text-gray-500 mb-2 text-sm">Try adjusting your filters</p>
            <button onClick={() => handleFilterChange(defaultFilters)} className="bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold px-8 py-3 rounded-2xl hover:opacity-90 transition mt-4">
              Reset Filters 🔄
            </button>
          </div>
        ) : (
          <>
            <div className="relative w-full mb-5" style={{ height:"65vh", maxHeight:560 }}>
              {nextProfile && (
                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-lg" style={{ transform:"scale(0.95) translateY(8px)", zIndex:1 }}>
                  <img src={nextProfile.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(nextProfile.name)}&size=400&background=fb923c&color=fff`} alt={nextProfile.name} className="w-full h-full object-cover"/>
                  <div className="absolute inset-0" style={{ background:"linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }}/>
                </div>
              )}
              <div style={{ position:"absolute", inset:0, zIndex:2 }}>
                <SwipeCard profile={currentProfile} onLike={handleLike} onPass={handlePass} isTop={true}/>
              </div>
            </div>

            <div className="flex items-center justify-center gap-5">
              <button onClick={handlePass} className="w-14 h-14 rounded-full bg-white shadow-lg border-2 border-gray-200 flex items-center justify-center hover:border-red-300 hover:scale-110 transition-all active:scale-95">
                <X className="w-6 h-6 text-gray-500"/>
              </button>
              <button onClick={handlePass} className="w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:scale-110 transition-all">
                <Star className="w-5 h-5 text-yellow-400"/>
              </button>
              <button onClick={handleLike} className="w-16 h-16 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all active:scale-95" style={{ background:"linear-gradient(135deg,#f43f5e,#fb923c)" }}>
                <Heart className="w-7 h-7 text-white fill-white"/>
              </button>
            </div>
            <p className="text-center text-gray-400 text-xs mt-4">← Swipe left to pass · Swipe right to like →</p>
            <p className="text-center text-gray-400 text-xs mt-1">{currentIndex+1} / {profiles.length}</p>
          </>
        )}
      </div>
    </div>
  );
}
