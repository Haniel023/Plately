import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import {
  getWeekStart,
  toDateString,
  addDays,
  formatWeekRange,
  getTodayDayKey,
} from "../lib/recipeHelpers";
import { DAYS_OF_WEEK, DAY_LABELS } from "../lib/constants";
import Header from "../components/common/Header";
import BottomNavigation from "../components/common/BottomNavigation";
import WeekCalendar from "../components/planner/WeekCalendar";
import DayViewPanel from "../components/planner/DayViewPanel";
import RecipePickerModal from "../components/modals/RecipePickerModal";
import "../App.css";

function MealPlanner() {
  const [user, setUser] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const [mealPlan, setMealPlan] = useState(null);
  const [slots, setSlots] = useState([]);
  const [viewMode, setViewMode] = useState("week");
  const [activeDay, setActiveDay] = useState(getTodayDayKey());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadWeek(session.user.id, currentWeekStart);
    });
  }, []);

  useEffect(() => {
    if (user) loadWeek(user.id, currentWeekStart);
  }, [currentWeekStart]);

  async function loadWeek(userId, weekStart) {
    setLoading(true);
    const weekStr = toDateString(weekStart);

    let { data: plan } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("week_start", weekStr)
      .maybeSingle();

    if (!plan) {
      const { data: newPlan } = await supabase
        .from("meal_plans")
        .insert([{ user_id: userId, week_start: weekStr }])
        .select()
        .single();
      plan = newPlan;
    }

    setMealPlan(plan);

    if (plan) {
      const { data: slotData } = await supabase
        .from("meal_plan_slots")
        .select("*, recipes(id, title, cover_url, category, serving_size, ingredients(*))")
        .eq("meal_plan_id", plan.id);
      setSlots(slotData || []);
    }

    setLoading(false);
  }

  async function handleSlotClick(day, mealTime) {
    setPickerTarget({ day, mealTime });
    setShowPicker(true);
  }

  async function handlePickRecipe(recipe) {
    if (!mealPlan || !pickerTarget) return;
    setShowPicker(false);

    await supabase.from("meal_plan_slots").upsert(
      [
        {
          meal_plan_id: mealPlan.id,
          day_of_week: pickerTarget.day,
          meal_time: pickerTarget.mealTime,
          recipe_id: recipe.id,
        },
      ],
      { onConflict: "meal_plan_id,day_of_week,meal_time" }
    );

    loadWeek(user.id, currentWeekStart);
  }

  async function handleSlotClear(day, mealTime) {
    if (!mealPlan) return;
    await supabase
      .from("meal_plan_slots")
      .delete()
      .eq("meal_plan_id", mealPlan.id)
      .eq("day_of_week", day)
      .eq("meal_time", mealTime);

    setSlots(slots.filter((s) => !(s.day_of_week === day && s.meal_time === mealTime)));
  }

  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));

  const pickerLabel = pickerTarget
    ? `${DAY_LABELS[pickerTarget.day]} ${pickerTarget.mealTime}`
    : "";

  return (
    <>
      <Header displayName={user?.email} />
      <div className="app-shell">
        <div className="top-bar">
          <div>
            <p className="eyebrow">Plan</p>
            <h1>Meal Planner</h1>
          </div>
        </div>

        <div className="planner-week-nav">
          <button className="icon-btn" onClick={prevWeek}>
            <ChevronLeft size={18} />
          </button>
          <span className="planner-week-label">{formatWeekRange(currentWeekStart)}</span>
          <button className="icon-btn" onClick={nextWeek}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn${viewMode === "week" ? " active" : ""}`}
              onClick={() => setViewMode("week")}
            >
              Week
            </button>
            <button
              className={`view-toggle-btn${viewMode === "day" ? " active" : ""}`}
              onClick={() => setViewMode("day")}
            >
              Day
            </button>
          </div>

          {viewMode === "day" && (
            <div className="space-pills" style={{ margin: 0, flex: 1 }}>
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  className={`space-pill${activeDay === day ? " active" : ""}`}
                  onClick={() => setActiveDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
            Loading planner...
          </div>
        ) : viewMode === "week" ? (
          <WeekCalendar
            slots={slots}
            onSlotClick={handleSlotClick}
            onSlotClear={handleSlotClear}
          />
        ) : (
          <DayViewPanel
            day={activeDay}
            slots={slots}
            onSlotClick={handleSlotClick}
            onSlotClear={handleSlotClear}
          />
        )}
      </div>

      <RecipePickerModal
        show={showPicker}
        targetLabel={pickerLabel}
        onSelect={handlePickRecipe}
        onClose={() => setShowPicker(false)}
      />

      <BottomNavigation />
    </>
  );
}

export default MealPlanner;
