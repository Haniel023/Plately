import { MEAL_TIMES } from "../../lib/constants";
import MealSlot from "./MealSlot";

function DayColumn({ day, dayLabel, slots, onSlotClick, onSlotClear, isToday }) {
  return (
    <div className="day-column">
      <div className={`day-column-header${isToday ? " today" : ""}`}>
        {day}
      </div>
      {MEAL_TIMES.map((mealTime) => {
        const slot = slots.find(
          (s) => s.day_of_week === day && s.meal_time === mealTime
        );
        return (
          <MealSlot
            key={mealTime}
            day={day}
            mealTime={mealTime}
            slot={slot}
            onSlotClick={onSlotClick}
            onSlotClear={onSlotClear}
          />
        );
      })}
    </div>
  );
}

export default DayColumn;
