import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, X, CheckCircle, LogOut } from "lucide-react";
import Header from "@/components/layout/Header";

function ProfileCompletion({ profile }: { profile: any }) {
  const fields = [
    { label: "Name", done: !!profile.name },
    { label: "Age", done: !!profile.age },
    { label: "Bio", done: !!profile.bio },
    { label: "Gender", done: !!profile.gender },
    { label: "Preference", done: !!profile.interestedIn },
    { label: "Photo", done: profile.photos?.length > 0 },
  ];
  const pct = Math.round((fields.filter((f) => f.done).length / fields.length) * 100);
  return (
    <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-gray-800 text-sm">Profile Completion</span>
        <span className="font-black text-rose-500 text-lg">{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#f43f5e,#fb923c)" }}/>
      </div>
      <div className="flex flex-wrap gap-2">
        {fields.map((f) => (
          <span key={f.label} className={`text-xs px-2 py-1 rounded-full font-medium ${f.done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {f.done ? "✓" : "○"} {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ name: "", age: "", bio: "", gender: "", interestedIn: "" });
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchProfile();
  }, []);

  const token = () => localStorage.getItem("token") || "";

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const r = await fetch("/api/profile", { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) {
        setProfile(d.profile);
        setForm({ name: d.profile.name || "", age: d.profile.age?.toString() || "", bio: d.profile.bio || "", gender: d.profile.gender || "", interestedIn: d.profile.interestedIn || "" });
        setPhotos(d.profile.photos || []);
      }
    } catch { setError("Could not load profile"); }
    finally { setLoading(false); }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (photos.length >= 6) { setError("Max 6 photos allowed"); return; }

    setUploadingPhoto(true); setError("");
    for (const file of files.slice(0, 6 - photos.length)) {
      try {
        const reader = new FileReader();
        const imageData = await new Promise<string>((res) => { reader.onload = () => res(reader.result as string); reader.readAsDataURL(file); });
        const r = await fetch("/api/upload/photo", {
          method: "POST",
          headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
          body: JSON.stringify({ imageData, filename: file.name }),
        });
        const d = await r.json();
        if (d.success) setPhotos((prev) => [...prev, d.url]);
        else setError(d.message || "Upload failed");
      } catch { setError("Photo upload failed"); }
    }
    setUploadingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (idx: number) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const r = await fetch("/api/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: parseInt(form.age), existingPhotos: photos }),
      });
      const d = await r.json();
      if (d.success) {
        setSuccess("Profile saved! 🎉");
        setProfile(d.profile);
        setPhotos(d.profile.photos || []);
        setTimeout(() => navigate("/discover"), 1500);
      } else setError(d.message || "Save failed");
    } catch { setError("An error occurred"); }
    finally { setSaving(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); localStorage.removeItem("userId");
    navigate("/");
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Header/>
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center"><div className="text-4xl animate-pulse mb-3">✨</div><p className="text-gray-600">Loading profile...</p></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Header/>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
            <p className="text-gray-500 text-sm">Make a great first impression</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-500 text-sm font-medium transition">
            <LogOut className="w-4 h-4"/> Logout
          </button>
        </div>

        {profile && <ProfileCompletion profile={{ ...profile, photos }}/>}

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4"/>{success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Photos <span className="text-gray-400 font-normal text-sm">({photos.length}/6)</span></h2>
            <p className="text-gray-500 text-sm mb-4">First photo is your main profile picture</p>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                  <img src={url.startsWith("/") ? url : url} alt={`Photo ${idx+1}`} className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"/>
                  <button type="button" onClick={() => removePhoto(idx)}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                    <X className="w-3 h-3"/>
                  </button>
                  {idx === 0 && <div className="absolute bottom-1.5 left-1.5 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">Main</div>}
                </div>
              ))}
              {photos.length < 6 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-rose-400 flex flex-col items-center justify-center cursor-pointer hover:bg-rose-50 transition-all group">
                  {uploadingPhoto ? (
                    <div className="text-2xl animate-spin">⏳</div>
                  ) : (
                    <>
                      <Camera className="w-7 h-7 text-gray-300 group-hover:text-rose-400 transition mb-1"/>
                      <span className="text-xs text-gray-400 group-hover:text-rose-400">Add Photo</span>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handlePhotoSelect} className="hidden" disabled={uploadingPhoto}/>
                </label>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Basic Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1">Name</Label>
                <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Your name" required className="rounded-xl"/>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1">Age</Label>
                <Input type="number" value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} min="18" max="99" required className="rounded-xl"/>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1">Gender</Label>
                <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-rose-300 focus:outline-none">
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1">Interested in</Label>
                <select value={form.interestedIn} onChange={(e) => setForm({...form, interestedIn: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-rose-300 focus:outline-none">
                  <option value="">Select...</option>
                  <option value="male">Men</option>
                  <option value="female">Women</option>
                  <option value="both">Everyone</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1">Bio</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} placeholder="Tell people about yourself... what makes you unique? 😊" className="resize-none h-24 rounded-xl" maxLength={300}/>
              <p className="text-right text-xs text-gray-400 mt-1">{form.bio.length}/300</p>
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full h-12 text-white font-bold rounded-2xl text-base hover:opacity-90 transition" style={{ background: "linear-gradient(135deg,#f43f5e,#fb923c)" }}>
            {saving ? "Saving..." : "Save Profile ✨"}
          </Button>
        </form>
      </div>
    </div>
  );
}
