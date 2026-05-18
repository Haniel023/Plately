import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Edit2, Save } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/common/Header";
import BottomNavigation from "../components/common/BottomNavigation";
import "../App.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
    });
  }, []);

  async function loadProfile(userId) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
      setForm({ full_name: data.full_name || "", bio: data.bio || "" });
    }

    setLoading(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: form.full_name, bio: form.bio })
      .eq("id", user.id);

    if (error) {
      setMessage("Failed to save changes.");
    } else {
      setProfile({ ...profile, ...form });
      setEditing(false);
      setMessage("Profile updated!");
      setTimeout(() => setMessage(""), 2000);
    }

    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const initials = (profile?.full_name || user?.email || "?")
    .charAt(0)
    .toUpperCase();

  if (loading) {
    return (
      <>
        <Header />
        <div className="app-shell" style={{ textAlign: "center", paddingTop: 60 }}>
          Loading profile...
        </div>
      </>
    );
  }

  return (
    <>
      <Header displayName={user?.email} />
      <div className="app-shell">
        <div className="top-bar">
          <div>
            <p className="eyebrow">Account</p>
            <h1>Profile</h1>
          </div>
          <button className="icon-btn danger" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>

        <div className="section-card">
          <div className="profile-header">
            <div className="profile-avatar-lg">{initials}</div>
            <div>
              <h2 className="profile-name">
                {profile?.full_name || "No name set"}
              </h2>
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>

          {editing ? (
            <>
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Your full name"
              />

              <label className="form-label">Bio</label>
              <textarea
                className="form-textarea"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell us about your cooking style..."
              />

              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button
                  className="primary-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => {
                    setEditing(false);
                    setForm({ full_name: profile.full_name || "", bio: profile.bio || "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {profile?.bio && (
                <p style={{ color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>
                  {profile.bio}
                </p>
              )}
              <button
                className="small-add-btn"
                onClick={() => setEditing(true)}
                style={{ marginTop: 16 }}
              >
                <Edit2 size={14} />
                Edit Profile
              </button>
            </>
          )}

          {message && (
            <p className="message success" style={{ marginTop: 12 }}>{message}</p>
          )}
        </div>

        <div className="section-card">
          <button
            className="danger-btn"
            onClick={handleLogout}
            style={{ width: "100%", justifyContent: "center" }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
      <BottomNavigation />
    </>
  );
}

export default Profile;
