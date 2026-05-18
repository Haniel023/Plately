# RecipeBook — Project Guide

## What This Is

A recipe-sharing web app where users can:
- Browse and share recipes with ingredient cost tracking
- Plan meals on a weekly or daily calendar
- Track grocery expenses from planned meals + misc costs

Built by: Claude Code (claude-sonnet-4-6) alongside the developer.

---

## Tech Stack

| Tool | Version |
|---|---|
| React | 19 |
| Vite | 8 |
| react-router-dom | 7 |
| @supabase/supabase-js | 2 |
| lucide-react | latest |
| CSS | Vanilla (no Tailwind, no CSS-in-JS) |
| Language | JavaScript (JSX only, no TypeScript) |

State management: plain `useState` / `useEffect` hooks. No Redux, no Zustand, no Context.

---

## Getting Started

### 1. Environment
`.env` already has Supabase credentials filled in.

### 2. Run the Supabase Schema
Open the Supabase Dashboard → SQL Editor and run the full contents of `supabase_schema.sql`. This creates all 6 tables with RLS policies.

### 3. Create Storage Bucket
In Supabase Dashboard → Storage → New Bucket:
- Name: `recipe-covers`
- Set to **Public**
- Allow authenticated uploads

### 4. Start Dev Server
```bash
npm install
npm run dev
```

---

## Features

| Page | Route | Auth Required |
|---|---|---|
| Browse Recipes | `/browse` | No |
| Recipe Detail | `/recipes/:id` | No |
| Share Recipe | `/share` | Yes |
| Edit Recipe | `/recipes/:id/edit` | Yes |
| My Recipes | `/my-recipes` | Yes |
| Meal Planner | `/planner` | Yes |
| Expense Tracker | `/expenses` | Yes |
| Profile | `/profile` | Yes |

---

## Project Structure

```
src/
  lib/
    supabaseClient.js     — Supabase client (reads .env)
    constants.js          — CATEGORIES, DAYS_OF_WEEK, MEAL_TIMES, UNITS, NAV_TABS
    recipeHelpers.js      — costPerServing(), getWeekStart(), formatCurrency() (₱)

  pages/
    Login.jsx             — Supabase auth + navigate to /browse
    Register.jsx          — signUp + insert into profiles table
    Browse.jsx            — Public recipe feed, search + category filter
    RecipeDetail.jsx      — Full recipe view, cost breakdown, owner edit/delete
    ShareRecipe.jsx       — Create recipe (image upload, ingredients, steps)
    EditRecipe.jsx        — Pre-populated edit form (delete+reinsert pattern)
    MyRecipes.jsx         — User's own recipes with CRUD actions
    MealPlanner.jsx       — Week/day calendar, recipe picker modal, upsert slots
    ExpenseTracker.jsx    — Planned cost + misc expenses per week
    Profile.jsx           — Edit full_name, bio, logout

  components/
    common/               — AppLoader, Header, BottomNavigation, FloatingAddButton,
                            EmptyState, ConfirmDialog
    recipe/               — RecipeCard, RecipeCardGrid, CategoryFilter, SearchBar,
                            IngredientList, StepList, CostSummary
    form/                 — IngredientRow, StepRow, ImageUploader
    planner/              — WeekCalendar, DayColumn, MealSlot, DayViewPanel
    expenses/             — ExpenseSummaryCard, MiscExpenseList
    modals/               — RecipePickerModal, MiscExpenseModal
```

---

## Database Schema

### Tables

| Table | Purpose |
|---|---|
| `profiles` | User display name, email, bio — linked to `auth.users` |
| `recipes` | Title, category, serving size, cover image URL, public flag |
| `ingredients` | Per-recipe: name, quantity, unit, price_per_unit |
| `steps` | Per-recipe: ordered cooking instructions |
| `meal_plans` | One row per user per week (keyed by `week_start` date, always Monday) |
| `meal_plan_slots` | One recipe per day+meal_time slot within a plan |
| `expenses` | Misc manual expenses tied to a meal plan week |

### Cost Formula
Ingredient costs are **not stored** — computed client-side:
```js
cost_per_serving = SUM(quantity × price_per_unit) / serving_size
```

### Image Storage
Bucket: `recipe-covers` (public)
Upload path: `{user_id}/{timestamp}-{filename}`

---

## Code Patterns

### Data fetching
Direct Supabase calls inside `useEffect` — no caching layer:
```js
useEffect(() => {
  supabase.from('recipes').select('*, profiles(full_name), ingredients(*)').then(...)
}, []);
```

### Form state
Lifted to the page component. Modals receive `form` + `setForm` as props.

### Meal planner upsert
```js
supabase.from('meal_plan_slots').upsert(
  [{ meal_plan_id, day_of_week, meal_time, recipe_id }],
  { onConflict: 'meal_plan_id,day_of_week,meal_time' }
)
```

### Edit recipe saves
Delete old ingredients + steps, then re-insert — simpler than diffing.

### Auth guard
`ProtectedRoute` in `App.jsx` calls `supabase.auth.getSession()`, shows `AppLoader` while pending, redirects to `/login` if no session.

---

## CSS Design System

Defined as CSS custom properties in `index.css`:

```css
--primary: #e67e22        /* warm orange */
--primary-dark: #d35400
--primary-light: #fef3e2
--accent: #27ae60          /* fresh green (costs) */
--surface: #ffffff
--bg: #fafaf8
--text: #1a1a1a
--text-muted: #6b7280
--border: #e5e7eb
--danger: #ef4444
```

Mobile-first, `max-width: 700px` breakpoint. No dark mode in v1. Currency: Philippine Peso (₱).

---

## Reference Projects

This app's patterns are modeled after `d:\10_VSC\ReactJS\SpendieClone` — same stack, same CSS conventions, same Supabase integration style. When in doubt, check SpendieClone for reference implementations.
