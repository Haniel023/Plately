import { DAYS_OF_WEEK } from "../../lib/constants";
import { getTodayDayKey } from "../../lib/recipeHelpers";
import DayColumn from "./DayColumn";

function WeekCalendar({ slots, onSlotClick, onSlotClear }) {
  const today = getTodayDayKey();

  return (
    <div className="week-calendar">
      {DAYS_OF_WEEK.map((day) => (
        <DayColumn
          key={day}
          day={day}
          slots={slots}
          onSlotClick={onSlotClick}
          onSlotClear={onSlotClear}
          isToday={day === today}
        />
      ))}
    </div>
  );
}

export default WeekCalendar;
