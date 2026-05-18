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
import StarRating from "../components/recipe/StarRating";
import CommentSection from "../components/recipe/CommentSection";
import ConfirmDialog from "../components/common/ConfirmDialog";
import "../App.css";

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [ratingMsg, setRatingMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });
    loadRecipe();
    loadComments();
  }, [id]);

  async function loadRecipe() {
    setLoading(true);
    const [recipeRes, ingrRes, stepsRes, ratingsRes] = await Promise.all([
      supabase.from("recipes").select("*, profiles(full_name)").eq("id", id).single(),
      supabase.from("ingredients").select("*").eq("recipe_id", id).order("sort_order"),
      supabase.from("steps").select("*").eq("recipe_id", id).order("step_number"),
      supabase.from("ratings").select("*").eq("recipe_id", id),
    ]);

    if (recipeRes.error) {
      setMessage("Recipe not found.");
      setLoading(false);
      return;
    }

    setRecipe(recipeRes.data);
    setIngredients(ingrRes.data || []);
    setSteps(stepsRes.data || []);
    setRatings(ratingsRes.data || []);

    const session = await supabase.auth.getSession();
    const uid = session.data.session?.user?.id;
    if (uid) {
      const mine = (ratingsRes.data || []).find((r) => r.user_id === uid);
      setMyRating(mine?.rating ?? null);
    }

    setLoading(false);
  }

  async function loadComments() {
    setCommentsLoading(true);
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(full_name)")
      .eq("recipe_id", id)
      .order("created_at", { ascending: true });
    setComments(data || []);
    setCommentsLoading(false);
  }

  async function handleRate(star) {
    if (!currentUser) return;
    setRatingMsg("");

    const existing = ratings.find((r) => r.user_id === currentUser.id);

    if (existing) {
      await supabase.from("ratings").update({ rating: star }).eq("id", existing.id);
      setRatings(ratings.map((r) => (r.id === existing.id ? { ...r, rating: star } : r)));
    } else {
      const { data } = await supabase
        .from("ratings")
        .insert([{ recipe_id: id, user_id: currentUser.id, rating: star }])
        .select()
        .single();
      if (data) setRatings([...ratings, data]);
    }

    setMyRating(star);
    setRatingMsg("Rating saved!");
    setTimeout(() => setRatingMsg(""), 2000);
  }

  async function handleCommentSubmit(body) {
    if (!currentUser) return;
    const { data } = await supabase
      .from("comments")
      .insert([{ recipe_id: id, user_id: currentUser.id, body }])
      .select("*, profiles(full_name)")
      .single();
    if (data) setComments([...comments, data]);
  }

  async function handleCommentDelete(commentId) {
    await supabase.from("comments").delete().eq("id", commentId);
    setComments(comments.filter((c) => c.id !== commentId));
  }

  async function handleDelete() {
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) { setMessage("Failed to delete recipe."); return; }
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
  const avgRating = ratings.length
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

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
          <Link to={`/users/${recipe.author_id}`} className="recipe-meta-chip">
            <Users size={14} />
            {recipe.profiles?.full_name || "Anonymous"}
          </Link>
          <span className="recipe-meta-chip">
            <Utensils size={14} />
            {recipe.serving_size} serving{recipe.serving_size !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Rating display + interactive widget */}
        <div className="rating-section">
          <div className="rating-summary">
            <StarRating value={avgRating} size={20} />
            <span className="rating-avg">
              {ratings.length > 0
                ? `${avgRating.toFixed(1)} (${ratings.length} rating${ratings.length !== 1 ? "s" : ""})`
                : "No ratings yet"}
            </span>
          </div>

          {currentUser && !isOwner && (
            <div className="rating-user">
              <span className="rating-user-label">
                {myRating ? "Your rating:" : "Rate this recipe:"}
              </span>
              <StarRating value={myRating ?? 0} onChange={handleRate} size={24} />
              {ratingMsg && <span className="rating-saved">{ratingMsg}</span>}
            </div>
          )}
        </div>

        {recipe.description && (
          <div className="section-card">
            <p style={{ margin: 0, lineHeight: 1.6 }}>{recipe.description}</p>
          </div>
        )}

        <CostSummary ingredients={ingredients} servingSize={recipe.serving_size} />

        <div className="section-card">
          <div className="section-header"><h2>Ingredients</h2></div>
          <IngredientList ingredients={ingredients} />
        </div>

        <div className="section-card">
          <div className="section-header"><h2>Steps</h2></div>
          <StepList steps={steps} />
        </div>

        <CommentSection
          comments={comments}
          currentUserId={currentUser?.id}
          onSubmit={handleCommentSubmit}
          onDelete={handleCommentDelete}
          loading={commentsLoading}
        />
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
