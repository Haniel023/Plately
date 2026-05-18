import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/common/Header";
import BottomNavigation from "../components/common/BottomNavigation";
import RecipeCardGrid from "../components/recipe/RecipeCardGrid";
import "../App.css";

function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    setLoading(true);
    const [profileRes, recipesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).single(),
      supabase
        .from("recipes")
        .select("*, profiles(full_name), ingredients(*), ratings(rating)")
        .eq("author_id", id)
        .eq("is_public", true)
        .order("created_at", { ascending: false }),
    ]);

    if (profileRes.error || !profileRes.data) {
      setNotFound(true);
    } else {
      setProfile(profileRes.data);
      setRecipes(recipesRes.data || []);
    }
    setLoading(false);
  }

  const initials = (profile?.full_name || "?").charAt(0).toUpperCase();

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

  if (notFound) {
    return (
      <>
        <Header />
        <div className="app-shell" style={{ textAlign: "center", paddingTop: 60 }}>
          <p style={{ fontSize: 48 }}>👤</p>
          <h2>Profile not found</h2>
          <button className="primary-btn" onClick={() => navigate("/browse")} style={{ margin: "0 auto" }}>
            Browse Recipes
          </button>
        </div>
        <BottomNavigation />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="app-shell">
        <button className="back-link" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="section-card">
          <div className="profile-header">
            <div className="profile-avatar-lg">{initials}</div>
            <div>
              <h2 className="profile-name">{profile.full_name || "Chef"}</h2>
              <p className="profile-email">{profile.email}</p>
            </div>
          </div>
          {profile.bio && (
            <p style={{ color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>
              {profile.bio}
            </p>
          )}
        </div>

        <div className="section-card">
          <div className="section-header">
            <div>
              <h2>Recipes</h2>
              <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 14 }}>
                {recipes.length} public recipe{recipes.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <RecipeCardGrid recipes={recipes} />
        </div>
      </div>
      <BottomNavigation />
    </>
  );
}

export default PublicProfile;
