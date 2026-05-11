import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import Header from "@/components/layout/Header";

interface Match { id: string; name: string; photos: string[]; age: number; }
interface Message { id: string; fromId: string; toId: string; text: string; createdAt: string; }
interface Conversation { match: Match; lastMessage: Message | null; unreadCount: number; }

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem("userId") || "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll messages every 3s when chat is open
  useEffect(() => {
    if (!activeMatch) return;
    const interval = setInterval(() => loadMessages(activeMatch.id), 3000);
    return () => clearInterval(interval);
  }, [activeMatch]);

  const token = () => localStorage.getItem("token") || "";

  const loadConversations = async () => {
    try {
      setLoading(true);
      const r = await fetch("/api/messages/conversations", { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) setConversations(d.conversations);
    } catch {}
    finally { setLoading(false); }
  };

  const loadMessages = async (matchId: string) => {
    try {
      const r = await fetch(`/api/messages/${matchId}`, { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) setMessages(d.messages);
    } catch {}
  };

  const openChat = async (match: Match) => {
    setActiveMatch(match);
    await loadMessages(match.id);
  };

  const sendMessage = async () => {
    if (!text.trim() || !activeMatch || sending) return;
    setSending(true);
    const msgText = text.trim();
    setText("");
    try {
      const r = await fetch(`/api/messages/${activeMatch.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: msgText }),
      });
      const d = await r.json();
      if (d.success) setMessages((prev) => [...prev, d.message]);
    } catch {}
    finally { setSending(false); }
  };

  const avatar = (m: Match) => m.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=f43f5e&color=fff&bold=true`;

  // ── Chat View ──
  if (activeMatch) return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Chat header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-4 py-3 flex items-center gap-3">
        <button onClick={() => { setActiveMatch(null); loadConversations(); }} className="text-gray-600 hover:text-gray-900 p-1">
          <ArrowLeft className="w-5 h-5"/>
        </button>
        <img src={avatar(activeMatch)} alt={activeMatch.name} className="w-10 h-10 rounded-full object-cover"/>
        <div>
          <p className="font-bold text-gray-900">{activeMatch.name}</p>
          <p className="text-xs text-green-500 font-medium">● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: "#fdf2f8" }}>
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-gray-500 font-medium">Say hi to {activeMatch.name}!</p>
            <p className="text-gray-400 text-sm">You matched — now start the conversation</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.fromId === userId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && <img src={avatar(activeMatch)} alt="" className="w-7 h-7 rounded-full mr-2 self-end flex-shrink-0 object-cover"/>}
              <div>
                <div className={`px-4 py-2.5 rounded-2xl max-w-xs text-sm leading-relaxed ${
                  isMe
                    ? "text-white rounded-br-sm"
                    : "bg-white text-gray-900 shadow-sm rounded-bl-sm"
                }`} style={isMe ? { background: "linear-gradient(135deg,#f43f5e,#fb923c)" } : {}}>
                  {msg.text}
                </div>
                <p className={`text-xs text-gray-400 mt-1 ${isMe ? "text-right" : "text-left"}`}>{timeAgo(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}/>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-3 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder={`Message ${activeMatch.name}...`}
          className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-gray-50"
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          className="w-10 h-10 rounded-full flex items-center justify-center transition hover:scale-105 active:scale-95 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}
        >
          <Send className="w-4 h-4 text-white"/>
        </button>
      </div>
    </div>
  );

  // ── Conversations List ──
  return (
    <div className="min-h-screen bg-gray-50">
      <Header/>
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-gray-900 mb-5">Messages 💬</h1>

        {loading ? (
          <div className="text-center py-16">
            <div className="text-4xl animate-pulse mb-3">💬</div>
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
            <MessageCircle className="w-16 h-16 text-rose-300 mx-auto mb-4"/>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No matches yet</h2>
            <p className="text-gray-500 text-sm mb-6">Like someone and wait for them to like you back to start chatting</p>
            <button onClick={() => navigate("/discover")} className="bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition">
              Start Discovering 🔥
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(({ match, lastMessage, unreadCount }) => (
              <button
                key={match.id}
                onClick={() => openChat(match)}
                className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all text-left border border-gray-100"
              >
                <div className="relative flex-shrink-0">
                  <img src={avatar(match)} alt={match.name} className="w-14 h-14 rounded-full object-cover"/>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-gray-900">{match.name}, {match.age}</p>
                    {lastMessage && <span className="text-xs text-gray-400">{timeAgo(lastMessage.createdAt)}</span>}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {lastMessage ? (lastMessage.fromId === userId ? `You: ${lastMessage.text}` : lastMessage.text) : "Say hi! 👋"}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <div className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {unreadCount}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
