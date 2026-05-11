import { useEffect, useState, useRef } from "react";
import { Heart, MessageCircle, X } from "lucide-react";

interface Notification {
  id: string;
  type: "match" | "like" | "message";
  message: string;
  userName?: string;
  userPhoto?: string;
  userId?: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const es = new EventSource(`/api/notifications/stream?token=${token}`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const notif: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          ...data,
        };
        setNotifications(prev => [notif, ...prev].slice(0, 5));

        // Play sound
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = data.type === "match" ? 880 : 660;
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
        } catch {}

        // Auto remove after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notif.id));
        }, 5000);
      } catch {}
    };

    return () => { es.close(); };
  }, []);

  const remove = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      {notifications.map(n => (
        <div key={n.id} className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-3 animate-in slide-in-from-right">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            n.type === "match" ? "bg-rose-100" : n.type === "message" ? "bg-blue-100" : "bg-pink-100"
          }`}>
            {n.type === "match" ? <Heart className="w-5 h-5 text-rose-500 fill-rose-500"/> :
             n.type === "message" ? <MessageCircle className="w-5 h-5 text-blue-500"/> :
             <Heart className="w-5 h-5 text-pink-500"/>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {n.type === "match" ? "🎉 New Match!" : n.type === "message" ? "💬 New Message" : "❤️ New Like"}
            </p>
            <p className="text-xs text-gray-500 truncate">{n.message}</p>
          </div>
          <button onClick={() => remove(n.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="w-4 h-4"/>
          </button>
        </div>
      ))}
    </div>
  );
}
