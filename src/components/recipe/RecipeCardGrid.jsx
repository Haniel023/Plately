import RecipeCard from "./RecipeCard";
import EmptyState from "../common/EmptyState";

function RecipeCardGrid({ recipes, showActions, onEdit, onDelete }) {
  if (!recipes || recipes.length === 0) {
    return (
      <EmptyState
        icon="🍳"
        title="No recipes found"
        message="Try adjusting your search or category filter."
      />
    );
  }

  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          showActions={showActions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default RecipeCardGrid;
