import { MEAL_TIMES, DAY_LABELS, CATEGORY_EMOJI } from "../../lib/constants";
import { costPerServing, formatCurrency } from "../../lib/recipeHelpers";

function DayViewPanel({ day, slots, onSlotClick, onSlotClear }) {
  return (
    <div className="day-view-panel">
      <h2 style={{ marginTop: 0 }}>{DAY_LABELS[day]}</h2>
      {MEAL_TIMES.map((mealTime) => {
        const slot = slots.find(
          (s) => s.day_of_week === day && s.meal_time === mealTime
        );
        const recipe = slot?.recipes;
        const emoji = recipe ? (CATEGORY_EMOJI[recipe.category] || "🍽️") : null;
        const cost = recipe
          ? costPerServing(recipe.ingredients, recipe.serving_size)
          : null;

        return (
          <div key={mealTime} className="day-view-slot">
            <div className="day-view-slot-header">
              <span className="day-view-slot-label">{mealTime}</span>
              {recipe ? (
                <button
                  className="danger-btn"
                  onClick={() => onSlotClear(day, mealTime)}
                  style={{ fontSize: 12, padding: "6px 10px" }}
                >
                  Remove
                </button>
              ) : (
                <button
                  className="small-add-btn"
                  onClick={() => onSlotClick(day, mealTime)}
                >
                  + Add Recipe
                </button>
              )}
            </div>

            {recipe ? (
              <div className="day-view-recipe">
                {recipe.cover_url ? (
                  <img
                    src={recipe.cover_url}
                    alt={recipe.title}
                    className="day-view-recipe-cover"
                  />
                ) : (
                  <div className="day-view-recipe-placeholder">{emoji}</div>
                )}
                <div>
                  <div className="day-view-recipe-name">{recipe.title}</div>
                  <div className="day-view-recipe-cost">{formatCurrency(cost)}/serving</div>
                </div>
              </div>
            ) : (
              <p className="day-view-empty">No recipe planned</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default DayViewPanel;
