import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import {
  getWeekStart,
  toDateString,
  addDays,
  formatWeekRange,
  totalIngredientCost,
  costPerServing,
} from "../lib/recipeHelpers";
import Header from "../components/common/Header";
import BottomNavigation from "../components/common/BottomNavigation";
import FloatingAddButton from "../components/common/FloatingAddButton";
import ExpenseSummaryCard from "../components/expenses/ExpenseSummaryCard";
import MiscExpenseList from "../components/expenses/MiscExpenseList";
import MiscExpenseModal from "../components/modals/MiscExpenseModal";
import "../App.css";

function ExpenseTracker() {
  const [user, setUser] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const [mealPlan, setMealPlan] = useState(null);
  const [slots, setSlots] = useState([]);
  const [miscExpenses, setMiscExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [miscForm, setMiscForm] = useState({ label: "", amount: "" });
  const [saving, setSaving] = useState(false);

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
      const [slotsRes, expensesRes] = await Promise.all([
        supabase
          .from("meal_plan_slots")
          .select("*, recipes(id, title, serving_size, ingredients(*))")
          .eq("meal_plan_id", plan.id),
        supabase
          .from("expenses")
          .select("*")
          .eq("meal_plan_id", plan.id)
          .order("created_at"),
      ]);

      setSlots(slotsRes.data || []);
      setMiscExpenses(expensesRes.data || []);
    }

    setLoading(false);
  }

  const plannedCost = slots
    .filter((s) => s.recipes)
    .reduce((sum, s) => {
      return sum + totalIngredientCost(s.recipes.ingredients || []);
    }, 0);

  const miscTotal = miscExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  async function handleAddMisc() {
    if (!user || !mealPlan) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("expenses")
      .insert([
        {
          user_id: user.id,
          meal_plan_id: mealPlan.id,
          label: miscForm.label,
          amount: Number(miscForm.amount),
        },
      ])
      .select()
      .single();

    if (!error) {
      setMiscExpenses([...miscExpenses, data]);
      setMiscForm({ label: "", amount: "" });
      setShowModal(false);
    }

    setSaving(false);
  }

  async function handleDeleteMisc(id) {
    await supabase.from("expenses").delete().eq("id", id);
    setMiscExpenses(miscExpenses.filter((e) => e.id !== id));
  }

  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));

  return (
    <>
      <Header displayName={user?.email} />
      <div className="app-shell">
        <div className="top-bar">
          <div>
            <p className="eyebrow">Budget</p>
            <h1>Expenses</h1>
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

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
            Loading expenses...
          </div>
        ) : (
          <>
            <ExpenseSummaryCard plannedCost={plannedCost} miscTotal={miscTotal} />

            <div className="section-card">
              <div className="section-header">
                <div>
                  <h2>Meal Plan Breakdown</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                    Recipes planned for this week
                  </p>
                </div>
              </div>

              {slots.filter((s) => s.recipes).length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                  No recipes planned yet. Go to the Planner to add meals.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                  {slots
                    .filter((s) => s.recipes)
                    .map((slot) => {
                      const cost = totalIngredientCost(slot.recipes.ingredients || []);
                      return (
                        <div
                          key={`${slot.day_of_week}-${slot.meal_time}`}
                          className="misc-expense-item"
                        >
                          <div>
                            <div className="misc-expense-label">{slot.recipes.title}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              {slot.day_of_week} · {slot.meal_time}
                            </div>
                          </div>
                          <span className="misc-expense-amount">
                            {cost > 0
                              ? `₱${cost.toFixed(2)}`
                              : "—"}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="section-card">
              <div className="section-header">
                <div>
                  <h2>Misc Expenses</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                    Other costs this week
                  </p>
                </div>
              </div>
              <MiscExpenseList expenses={miscExpenses} onDelete={handleDeleteMisc} />
            </div>
          </>
        )}
      </div>

      <FloatingAddButton label="Add Expense" onClick={() => setShowModal(true)} />

      <MiscExpenseModal
        show={showModal}
        form={miscForm}
        setForm={setMiscForm}
        onSubmit={handleAddMisc}
        onClose={() => setShowModal(false)}
        loading={saving}
      />

      <BottomNavigation />
    </>
  );
}

export default ExpenseTracker;
