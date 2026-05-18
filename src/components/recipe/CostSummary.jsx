import { totalIngredientCost, costPerServing, formatCurrency } from "../../lib/recipeHelpers";

function CostSummary({ ingredients, servingSize }) {
  const total = totalIngredientCost(ingredients);
  const perServing = costPerServing(ingredients, servingSize);

  return (
    <div className="cost-summary-card">
      <h3>Cost Breakdown</h3>
      <div className="cost-summary-row">
        <span>Total ingredients</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <div className="cost-summary-row">
        <span>Serving size</span>
        <span>{servingSize} serving{servingSize !== 1 ? "s" : ""}</span>
      </div>
      <div className="cost-summary-row">
        <span>Cost per serving</span>
        <strong>{formatCurrency(perServing)}</strong>
      </div>
    </div>
  );
}

export default CostSummary;
