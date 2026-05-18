import { CATEGORY_EMOJI } from "../../lib/constants";

function MealSlot({ day, mealTime, slot, onSlotClick, onSlotClear }) {
  const recipe = slot?.recipes;
  const isFilled = !!recipe;
  const emoji = recipe ? (CATEGORY_EMOJI[recipe.category] || "🍽️") : null;

  return (
    <div
      className={`meal-slot${isFilled ? " filled" : ""}`}
      onClick={() => !isFilled && onSlotClick(day, mealTime)}
    >
      <span className="meal-slot-label">{mealTime}</span>

      {isFilled ? (
        <>
          <span className="meal-slot-recipe">
            {emoji} {recipe.title}
          </span>
          <button
            className="meal-slot-clear"
            onClick={(e) => {
              e.stopPropagation();
              onSlotClear(day, mealTime);
            }}
            title="Remove"
          >
            ×
          </button>
        </>
      ) : (
        <div className="meal-slot-add">+</div>
      )}
    </div>
  );
}

export default MealSlot;
