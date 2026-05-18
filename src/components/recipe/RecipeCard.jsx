import { Link } from "react-router-dom";
import { CATEGORY_EMOJI } from "../../lib/constants";
import { costPerServing, formatCurrency } from "../../lib/recipeHelpers";

function RecipeCard({ recipe, showActions, onEdit, onDelete }) {
  const emoji = CATEGORY_EMOJI[recipe.category] || "🍽️";
  const serving = costPerServing(recipe.ingredients, recipe.serving_size);

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
            <span className="recipe-card-author">
              {recipe.profiles?.full_name || "Anonymous"}
            </span>
            <span className="tag">{recipe.category}</span>
          </div>
          <div className="recipe-card-meta">
            <span className="recipe-card-cost">{formatCurrency(serving)}/serving</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {recipe.serving_size} serving{recipe.serving_size !== 1 ? "s" : ""}
            </span>
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
