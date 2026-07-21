import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Send } from "lucide-react";

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const r = await fetch("/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) {
        setConversations(d.conversations);
      }
    } catch (e) {
      console.error("Error fetching conversations", e);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: any) => {
    try {
      setSelectedConv(conv);
      const token = localStorage.getItem("token");
      const r = await fetch(`/api/messages/${conv.match.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) {
        setMessages(d.messages);
      }
    } catch (e) {
      console.error("Error fetching messages", e);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`/api/messages/${selectedConv.match.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: newMessage }),
      });
      const d = await r.json();
      if (d.success) {
        setMessages([...messages, d.message]);
        setNewMessage("");
      }
    } catch (e) {
      console.error("Error sending message", e);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center"><div className="text-5xl animate-bounce mb-3">💬</div><p>Loading messages...</p></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Header />
      <div className="max-w-6xl mx-auto h-[calc(100vh-80px)] flex gap-4 p-4">
        {/* Conversations List */}
        <div className="w-80 bg-white rounded-2xl shadow-lg overflow-y-auto">
          <div className="p-4 border-b sticky top-0 bg-white">
            <h2 className="text-xl font-black text-gray-900">Messages</h2>
          </div>
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div key={conv.match.id} onClick={() => selectConversation(conv)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                selectedConv?.match.id === conv.match.id ? "bg-rose-50" : ""
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-rose-400 to-orange-300 flex items-center justify-center text-xl">
                    {conv.match.photos?.[0] ? (
                      <img src={conv.match.photos[0]} alt={conv.match.name} className="w-full h-full object-cover" />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{conv.match.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{conv.lastMessage?.text || "No messages"}</p>
                  </div>
                  {conv.unreadCount > 0 && <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">{conv.unreadCount}</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chat Area */}
        {selectedConv ? (
          <div className="flex-1 bg-white rounded-2xl shadow-lg flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">{selectedConv.match.name}</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.fromId === localStorage.getItem("userId") ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.fromId === localStorage.getItem("userId")
                      ? "bg-gradient-to-r from-rose-500 to-orange-400 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t flex gap-3">
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === "Enter" && sendMessage()} placeholder="Type a message..." className="flex-1 px-4 py-2 border rounded-2xl focus:outline-none focus:border-rose-500" />
              <button onClick={sendMessage} className="px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-400 text-white rounded-2xl hover:opacity-90 font-semibold">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl text-gray-600">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
