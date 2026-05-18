import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/common/Header";
import BottomNavigation from "../components/common/BottomNavigation";
import SearchBar from "../components/recipe/SearchBar";
import CategoryFilter from "../components/recipe/CategoryFilter";
import RecipeCardGrid from "../components/recipe/RecipeCardGrid";
import "../App.css";

function Browse() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    loadRecipes();
  }, []);

  async function loadRecipes() {
    setLoading(true);
    const { data, error } = await supabase
      .from("recipes")
      .select("*, profiles(full_name), ingredients(*), ratings(rating)")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (!error) setRecipes(data || []);
    setLoading(false);
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
            <p className="eyebrow">Discover</p>
            <h1>Browse Recipes</h1>
          </div>
        </div>

        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter activeCategory={activeCategory} onSelect={setActiveCategory} />

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
            Loading recipes...
          </div>
        ) : (
          <RecipeCardGrid recipes={filtered} />
        )}
      </div>
      <BottomNavigation />
    </>
  );
}

export default Browse;
