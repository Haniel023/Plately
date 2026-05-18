import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { CATEGORY_EMOJI } from "../../lib/constants";
import SearchBar from "../recipe/SearchBar";
import CategoryFilter from "../recipe/CategoryFilter";

function RecipePickerModal({ show, targetLabel, onSelect, onClose }) {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setSearch("");
      setActiveCategory("All");
      loadRecipes();
    }
  }, [show]);

  async function loadRecipes() {
    setLoading(true);
    const { data } = await supabase
      .from("recipes")
      .select("*, ingredients(*)")
      .eq("is_public", true)
      .order("created_at", { ascending: false });
    setRecipes(data || []);
    setLoading(false);
  }

  if (!show) return null;

  const filtered = recipes.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || r.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box picker-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Pick a recipe</h2>
        {targetLabel && (
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 12 }}>
            For: <strong>{targetLabel}</strong>
          </p>
        )}

        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter activeCategory={activeCategory} onSelect={setActiveCategory} />

        {loading ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 20 }}>
            Loading recipes...
          </p>
        ) : (
          <div className="picker-recipe-list">
            {filtered.length === 0 ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 20 }}>
                No recipes found.
              </p>
            ) : (
              filtered.map((recipe) => {
                const emoji = CATEGORY_EMOJI[recipe.category] || "🍽️";
                return (
                  <div
                    key={recipe.id}
                    className="picker-recipe-item"
                    onClick={() => onSelect(recipe)}
                  >
                    {recipe.cover_url ? (
                      <img
                        src={recipe.cover_url}
                        alt={recipe.title}
                        className="picker-cover"
                      />
                    ) : (
                      <div className="picker-cover-placeholder">{emoji}</div>
                    )}
                    <div>
                      <div className="picker-recipe-name">{recipe.title}</div>
                      <div className="picker-recipe-meta">
                        {recipe.category} · {recipe.serving_size} serving
                        {recipe.serving_size !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default RecipePickerModal;
