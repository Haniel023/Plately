import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/common/Header";
import BottomNavigation from "../components/common/BottomNavigation";
import FloatingAddButton from "../components/common/FloatingAddButton";
import ConfirmDialog from "../components/common/ConfirmDialog";
import RecipeCardGrid from "../components/recipe/RecipeCardGrid";
import SearchBar from "../components/recipe/SearchBar";
import CategoryFilter from "../components/recipe/CategoryFilter";
import "../App.css";

function MyRecipes() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadRecipes(session.user.id);
    });
  }, []);

  async function loadRecipes(userId) {
    setLoading(true);
    const { data, error } = await supabase
      .from("recipes")
      .select("*, profiles(full_name), ingredients(*)")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setRecipes(data || []);
    setLoading(false);
  }

  async function handleDelete(recipe) {
    await supabase.from("recipes").delete().eq("id", recipe.id);
    setRecipes(recipes.filter((r) => r.id !== recipe.id));
    setConfirmTarget(null);
  }

  const filtered = recipes.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || r.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <>
      <Header displayName={user?.email} />
      <div className="app-shell">
        <div className="top-bar">
          <div>
            <p className="eyebrow">My Kitchen</p>
            <h1>My Recipes</h1>
          </div>
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="Search my recipes..." />
        <CategoryFilter activeCategory={activeCategory} onSelect={setActiveCategory} />

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
            Loading your recipes...
          </div>
        ) : (
          <RecipeCardGrid
            recipes={filtered}
            showActions
            onEdit={(r) => navigate(`/recipes/${r.id}/edit`)}
            onDelete={(r) => setConfirmTarget(r)}
          />
        )}
      </div>

      <FloatingAddButton label="New Recipe" onClick={() => navigate("/share")} />

      <ConfirmDialog
        show={!!confirmTarget}
        message={`Delete "${confirmTarget?.title}"? This cannot be undone.`}
        onConfirm={() => handleDelete(confirmTarget)}
        onCancel={() => setConfirmTarget(null)}
      />

      <BottomNavigation />
    </>
  );
}

export default MyRecipes;
