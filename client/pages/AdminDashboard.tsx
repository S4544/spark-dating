import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, MessageCircle, Heart, TrendingUp, 
  Trash2, Search, Shield, LogOut, Eye,
  CheckCircle, XCircle, RefreshCw, Ban
} from "lucide-react";

const ADMIN_KEY = "spark-admin-2024"; // Change this to match your .env ADMIN_KEY

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        {icon}
      </div>
      <p className="text-3xl font-black text-gray-900">{value ?? "..."}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  );
}

function UserRow({ user, onDelete, onView }: any) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete user ${user.name}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { "x-admin-key": ADMIN_KEY },
      });
      const d = await r.json();
      if (d.success) onDelete(user.id);
      else alert("Delete failed: " + d.message);
    } catch { alert("Delete failed"); }
    finally { setDeleting(false); }
  };

  const avatar = user.photos?.[0] || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f43f5e&color=fff&bold=true`;

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0"/>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
            <p className="text-gray-400 text-xs">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{user.age}</td>
      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{user.gender || "—"}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          user.email_verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
        }`}>
          {user.email_verified ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
          {user.email_verified ? "Verified" : "Unverified"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {user.photos?.length || 0} photos
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">
        {new Date(user.created_at).toLocaleDateString("en-IN")}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => onView(user)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="View details">
            <Eye className="w-4 h-4"/>
          </button>
          <button onClick={handleDelete} disabled={deleting} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete user">
            {deleting ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
          </button>
        </div>
      </td>
    </tr>
  );
}

function UserDetailModal({ user, onClose }: any) {
  if (!user) return null;
  const avatar = user.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f43f5e&color=fff&bold=true`;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-gray-900">User Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        
        <div className="text-center mb-6">
          <img src={avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-rose-100"/>
          <h2 className="text-2xl font-black text-gray-900">{user.name}, {user.age}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full mt-2 ${
            user.email_verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {user.email_verified ? "✅ Verified" : "⚠️ Unverified"}
          </span>
        </div>

        <div className="space-y-3">
          {[
            { label: "Gender", value: user.gender || "Not set" },
            { label: "Interested In", value: user.interested_in || "Not set" },
            { label: "Bio", value: user.bio || "No bio" },
            { label: "Photos", value: `${user.photos?.length || 0} uploaded` },
            { label: "Location", value: `${parseFloat(user.latitude || 0).toFixed(4)}, ${parseFloat(user.longitude || 0).toFixed(4)}` },
            { label: "Joined", value: new Date(user.created_at).toLocaleString("en-IN") },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500 text-sm font-medium">{label}</span>
              <span className="text-gray-900 text-sm text-right max-w-[200px]">{value}</span>
            </div>
          ))}
        </div>

        {user.photos?.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Photos</p>
            <div className="grid grid-cols-3 gap-2">
              {user.photos.map((p: string, i: number) => (
                <img key={i} src={p} alt={`Photo ${i+1}`} className="aspect-square rounded-xl object-cover"/>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogin = async () => {
    setKeyError("");
    try {
      const r = await fetch("/api/admin/stats", {
        headers: { "x-admin-key": keyInput },
      });
      if (r.status === 403) { setKeyError("Wrong admin key. Try again."); return; }
      const d = await r.json();
      if (d.success) {
        setAdminKey(keyInput);
        setAuthenticated(true);
        setStats(d.stats);
      }
    } catch { setKeyError("Connection failed"); }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsR, usersR] = await Promise.all([
        fetch("/api/admin/stats", { headers: { "x-admin-key": adminKey } }),
        fetch("/api/admin/users", { headers: { "x-admin-key": adminKey } }),
      ]);
      const [statsD, usersD] = await Promise.all([statsR.json(), usersR.json()]);
      if (statsD.success) setStats(statsD.stats);
      if (usersD.success) setUsers(usersD.users);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    if (filter === "verified") return matchSearch && u.email_verified;
    if (filter === "unverified") return matchSearch && !u.email_verified;
    if (filter === "male") return matchSearch && u.gender === "male";
    if (filter === "female") return matchSearch && u.gender === "female";
    if (filter === "photos") return matchSearch && u.photos?.length > 0;
    if (filter === "nophotos") return matchSearch && (!u.photos || u.photos.length === 0);
    return matchSearch;
  });

  // ── Admin Login Screen ──
  if (!authenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="bg-gray-900 rounded-3xl p-8 w-full max-w-sm border border-gray-800">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-rose-500"/>
          <span className="text-xl font-black text-white">Admin Panel</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-2">🔐 Sign In</h1>
        <p className="text-gray-400 text-sm mb-6">Enter your admin key to continue</p>
        {keyError && <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-xl text-red-400 text-sm">{keyError}</div>}
        <input
          type="password"
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          placeholder="Admin key..."
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        <button onClick={handleLogin} className="w-full py-3 rounded-xl font-bold text-white" style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
          Enter Dashboard →
        </button>
        <button onClick={() => navigate("/")} className="w-full mt-3 py-2 text-gray-500 text-sm hover:text-gray-300 transition">
          ← Back to App
        </button>
      </div>
    </div>
  );

  // ── Main Dashboard ──
  return (
    <div className="min-h-screen bg-gray-50">
      {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)}/>}

      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-56 bg-gray-900 text-white flex flex-col z-10">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-rose-500"/>
            <span className="font-black text-lg">Spark Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "overview", icon: <TrendingUp className="w-4 h-4"/>, label: "Overview" },
            { id: "users", icon: <Users className="w-4 h-4"/>, label: "Users" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === tab.id ? "bg-rose-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={() => { setAuthenticated(false); setAdminKey(""); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <LogOut className="w-4 h-4"/> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-56 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              {activeTab === "overview" ? "📊 Overview" : "👥 Users"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
            </p>
          </div>
          <button onClick={loadData} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}/>
            Refresh
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Users className="w-6 h-6 text-rose-500"/>} label="Total Users" value={stats?.totalUsers} color="bg-rose-50"/>
              <StatCard icon={<CheckCircle className="w-6 h-6 text-green-500"/>} label="Verified Users" value={stats?.verifiedUsers} color="bg-green-50"/>
              <StatCard icon={<Heart className="w-6 h-6 text-pink-500"/>} label="Total Matches" value={stats?.totalMatches} color="bg-pink-50"/>
              <StatCard icon={<MessageCircle className="w-6 h-6 text-blue-500"/>} label="Total Messages" value={stats?.totalMessages} color="bg-blue-50"/>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">👥 User Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: "Male users", value: users.filter(u => u.gender === "male").length, color: "bg-blue-500" },
                    { label: "Female users", value: users.filter(u => u.gender === "female").length, color: "bg-pink-500" },
                    { label: "With photos", value: users.filter(u => u.photos?.length > 0).length, color: "bg-green-500" },
                    { label: "Without photos", value: users.filter(u => !u.photos?.length).length, color: "bg-gray-300" },
                    { label: "Verified emails", value: users.filter(u => u.email_verified).length, color: "bg-rose-500" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${s.color}`}/>
                      <span className="text-gray-600 text-sm flex-1">{s.label}</span>
                      <span className="font-bold text-gray-900">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">🕐 Recent Signups</h3>
                <div className="space-y-3">
                  {users.slice(0, 6).map(u => (
                    <div key={u.id} className="flex items-center gap-3">
                      <img src={u.photos?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=f43f5e&color=fff&size=40`}
                        alt={u.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{u.name}</p>
                        <p className="text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString("en-IN")}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.email_verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {u.email_verified ? "✓" : "?"}
                      </span>
                    </div>
                  ))}
                  {users.length === 0 && <p className="text-gray-400 text-sm">No users yet</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            {/* Search & Filter */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <select value={filter} onChange={e => setFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
                <option value="all">All Users ({users.length})</option>
                <option value="verified">Verified ({users.filter(u => u.email_verified).length})</option>
                <option value="unverified">Unverified ({users.filter(u => !u.email_verified).length})</option>
                <option value="male">Male ({users.filter(u => u.gender === "male").length})</option>
                <option value="female">Female ({users.filter(u => u.gender === "female").length})</option>
                <option value="photos">Has Photos ({users.filter(u => u.photos?.length > 0).length})</option>
                <option value="nophotos">No Photos ({users.filter(u => !u.photos?.length).length})</option>
              </select>
              <span className="text-gray-500 text-sm">{filteredUsers.length} results</span>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["User", "Age", "Gender", "Status", "Photos", "Joined", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No users found</td></tr>
                    ) : (
                      filteredUsers.map(user => (
                        <UserRow
                          key={user.id}
                          user={user}
                          onDelete={(id: string) => setUsers(prev => prev.filter(u => u.id !== id))}
                          onView={setSelectedUser}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
