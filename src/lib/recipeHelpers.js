export function formatCurrency(amount) {
  return `₱${Number(amount || 0).toFixed(2)}`;
}

export function costPerServing(ingredients, servingSize) {
  const total = (ingredients || []).reduce((sum, ing) => {
    return sum + Number(ing.price_per_unit || 0);
  }, 0);
  return servingSize > 0 ? total / servingSize : total;
}

export function totalIngredientCost(ingredients) {
  return (ingredients || []).reduce((sum, ing) => {
    return sum + Number(ing.price_per_unit || 0);
  }, 0);
}

export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatWeekRange(weekStart) {
  const end = addDays(weekStart, 6);
  const opts = { month: "short", day: "numeric" };
  return `${weekStart.toLocaleDateString("en-PH", opts)} – ${end.toLocaleDateString("en-PH", opts)}`;
}

export function getTodayDayKey() {
  const day = new Date().getDay();
  const map = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };
  return map[day];
}

export function newIngredient() {
  return { id: crypto.randomUUID(), name: "", quantity: "", unit: "g", price_per_unit: "" };
}

export function newStep() {
  return { id: crypto.randomUUID(), instruction: "" };
}
