import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Edit, Trash2, Users, Utensils } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { CATEGORY_EMOJI } from "../lib/constants";
import Header from "../components/common/Header";
import BottomNavigation from "../components/common/BottomNavigation";
import IngredientList from "../components/recipe/IngredientList";
import StepList from "../components/recipe/StepList";
import CostSummary from "../components/recipe/CostSummary";
import ConfirmDialog from "../components/common/ConfirmDialog";
import "../App.css";

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });
    loadRecipe();
  }, [id]);

  async function loadRecipe() {
    setLoading(true);
    const [recipeRes, ingrRes, stepsRes] = await Promise.all([
      supabase.from("recipes").select("*, profiles(full_name)").eq("id", id).single(),
      supabase.from("ingredients").select("*").eq("recipe_id", id).order("sort_order"),
      supabase.from("steps").select("*").eq("recipe_id", id).order("step_number"),
    ]);

    if (recipeRes.error) {
      setMessage("Recipe not found.");
      setLoading(false);
      return;
    }

    setRecipe(recipeRes.data);
    setIngredients(ingrRes.data || []);
    setSteps(stepsRes.data || []);
    setLoading(false);
  }

  async function handleDelete() {
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) {
      setMessage("Failed to delete recipe.");
      return;
    }
    navigate("/my-recipes");
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="app-shell" style={{ textAlign: "center", paddingTop: 60 }}>
          Loading recipe...
        </div>
      </>
    );
  }

  if (!recipe || message) {
    return (
      <>
        <Header />
        <div className="app-shell">
          <p>{message || "Recipe not found."}</p>
          <Link to="/browse">← Back to Browse</Link>
        </div>
      </>
    );
  }

  const emoji = CATEGORY_EMOJI[recipe.category] || "🍽️";
  const isOwner = currentUser && currentUser.id === recipe.author_id;

  return (
    <>
      <Header displayName={currentUser?.email} />
      <div className="app-shell">
        <button className="back-link" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} />
          Back
        </button>

        {recipe.cover_url ? (
          <img src={recipe.cover_url} alt={recipe.title} className="recipe-detail-cover" />
        ) : (
          <div className="recipe-detail-placeholder">{emoji}</div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <h1 className="recipe-detail-title">{recipe.title}</h1>
          {isOwner && (
            <div className="action-buttons">
              <button className="edit-btn" onClick={() => navigate(`/recipes/${id}/edit`)} title="Edit">
                <Edit size={15} />
              </button>
              <button className="delete-btn" onClick={() => setShowConfirm(true)} title="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>

        <div className="recipe-meta-row">
          <span className="tag">{recipe.category}</span>
          <span className="recipe-meta-chip">
            <Users size={14} />
            {recipe.profiles?.full_name || "Anonymous"}
          </span>
          <span className="recipe-meta-chip">
            <Utensils size={14} />
            {recipe.serving_size} serving{recipe.serving_size !== 1 ? "s" : ""}
          </span>
        </div>

        {recipe.description && (
          <div className="section-card">
            <p style={{ margin: 0, lineHeight: 1.6 }}>{recipe.description}</p>
          </div>
        )}

        <CostSummary ingredients={ingredients} servingSize={recipe.serving_size} />

        <div className="section-card">
          <div className="section-header">
            <h2>Ingredients</h2>
          </div>
          <IngredientList ingredients={ingredients} />
        </div>

        <div className="section-card">
          <div className="section-header">
            <h2>Steps</h2>
          </div>
          <StepList steps={steps} />
        </div>
      </div>

      <ConfirmDialog
        show={showConfirm}
        message="This will permanently delete the recipe and all its ingredients and steps."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />

      <BottomNavigation />
    </>
  );
}

export default RecipeDetail;
