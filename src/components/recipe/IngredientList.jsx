import { formatCurrency } from "../../lib/recipeHelpers";

function IngredientList({ ingredients }) {
  if (!ingredients || ingredients.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No ingredients listed.</p>;
  }

  return (
    <div className="ingredient-list">
      {ingredients.map((ing) => (
        <div key={ing.id} className="ingredient-row">
          <span className="ingredient-name">{ing.name}</span>
          <div className="ingredient-right">
            <span>
              {ing.quantity} {ing.unit}
            </span>
            <span className="ingredient-price">
              {formatCurrency(ing.price_per_unit)}/{ing.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default IngredientList;
