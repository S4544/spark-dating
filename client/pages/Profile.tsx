import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const r = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) {
        setProfile(d.profile);
        setForm(d.profile);
      }
    } catch (e) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");
      const token = localStorage.getItem("token");
      const r = await fetch("/api/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.success) {
        setProfile(d.profile);
        setEditing(false);
        setSuccess("Profile updated!");
      } else {
        setError(d.message || "Update failed");
      }
    } catch (e) {
      setError("Connection error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="text-5xl animate-bounce mb-3">🔥</div><p>Loading profile...</p></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700">{success}</div>}
        
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
            <button onClick={() => setEditing(!editing)} className="px-4 py-2 rounded-full bg-rose-500 text-white font-semibold hover:bg-rose-600 transition">
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {profile && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  {editing ? (
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  ) : (
                    <p className="text-lg text-gray-900">{profile.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                  {editing ? (
                    <input type="number" value={form.age} onChange={e => setForm({...form, age: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                  ) : (
                    <p className="text-lg text-gray-900">{profile.age}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <p className="text-lg text-gray-600">{profile.email}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                {editing ? (
                  <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} maxLength={200} className="w-full px-4 py-2 border rounded-lg h-24 resize-none" />
                ) : (
                  <p className="text-gray-600">{profile.bio || "No bio yet"}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  {editing ? (
                    <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 capitalize">{profile.gender || "Not specified"}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Interested In</label>
                  {editing ? (
                    <select value={form.interestedIn} onChange={e => setForm({...form, interestedIn: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                      <option value="">Select</option>
                      <option value="male">Males</option>
                      <option value="female">Females</option>
                      <option value="both">Both</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 capitalize">{profile.interestedIn || "Not specified"}</p>
                  )}
                </div>
              </div>

              {editing && (
                <Button onClick={handleSave} className="w-full h-12 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-2xl">
                  Save Changes
                </Button>
              )}
            </div>
          )}

          <div className="mt-8 pt-8 border-t flex gap-4">
            <Button onClick={() => navigate("/discover")} className="flex-1 h-12 bg-gradient-to-r from-rose-500 to-orange-400 text-white font-semibold rounded-2xl">
              🔥 Back to Discover
            </Button>
            <Button onClick={handleLogout} className="flex-1 h-12 bg-gray-200 text-gray-900 font-semibold rounded-2xl hover:bg-gray-300">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
