import { Link } from "react-router-dom";
import { CATEGORY_EMOJI } from "../../lib/constants";
import { costPerServing, formatCurrency } from "../../lib/recipeHelpers";
import StarRating from "./StarRating";

function RecipeCard({ recipe, showActions, onEdit, onDelete }) {
  const emoji = CATEGORY_EMOJI[recipe.category] || "🍽️";
  const serving = costPerServing(recipe.ingredients, recipe.serving_size);
  const ratings = recipe.ratings || [];
  const avgRating = ratings.length
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  return (
    <div className="recipe-card" style={{ textDecoration: "none" }}>
      <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        {recipe.cover_url ? (
          <img src={recipe.cover_url} alt={recipe.title} className="recipe-card-cover" />
        ) : (
          <div className="recipe-card-placeholder">{emoji}</div>
        )}
        <div className="recipe-card-body">
          <p className="recipe-card-title">{recipe.title}</p>
          <div className="recipe-card-meta">
            <Link
              to={`/users/${recipe.author_id}`}
              className="recipe-card-author"
              onClick={(e) => e.stopPropagation()}
            >
              {recipe.profiles?.full_name || "Anonymous"}
            </Link>
            <span className="tag">{recipe.category}</span>
          </div>
          <div className="recipe-card-meta">
            <span className="recipe-card-cost">{formatCurrency(serving)}/serving</span>
            {avgRating > 0 ? (
              <span className="recipe-card-rating">
                <StarRating value={avgRating} size={12} />
                <span>{avgRating.toFixed(1)}</span>
              </span>
            ) : (
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {recipe.serving_size} serving{recipe.serving_size !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </Link>

      {showActions && (
        <div className="recipe-card-overlay-actions">
          <button className="edit-btn" onClick={() => onEdit(recipe)} title="Edit">
            ✏️
          </button>
          <button className="delete-btn" onClick={() => onDelete(recipe)} title="Delete">
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}

export default RecipeCard;
