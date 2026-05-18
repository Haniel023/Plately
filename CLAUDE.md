# Plately — Project Guide

## What This Is

A recipe-sharing web app where users can:
- Browse and share recipes with ingredient cost tracking
- Rate recipes (1–5 stars) and leave comments
- View public chef profiles and their recipes
- Plan meals on a weekly or daily calendar
- Track grocery expenses from planned meals + misc costs

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
Create a `.env` file in the project root:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Run the Supabase Schema
Open the Supabase Dashboard → SQL Editor and run the full contents of `supabase_schema.sql`. This creates all 8 tables with RLS policies and the auto-profile trigger.

### 3. Create Storage Bucket
In Supabase Dashboard → Storage → New Bucket:
- Name: `recipe-covers`
- Set to **Public**

Then run these storage policies in the SQL Editor:
```sql
CREATE POLICY "Users can upload covers" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'recipe-covers' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Public can view covers" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'recipe-covers');
CREATE POLICY "Users can delete their own covers" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'recipe-covers' AND (storage.foldername(name))[1] = auth.uid()::text);
```

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
| Public Profile | `/users/:id` | No |
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
    Register.jsx          — signUp + upsert into profiles table
    Browse.jsx            — Public recipe feed, search + category filter
    RecipeDetail.jsx      — Full recipe view, cost breakdown, ratings, comments, owner edit/delete
    ShareRecipe.jsx       — Create recipe (image upload, ingredients, steps)
    EditRecipe.jsx        — Pre-populated edit form (delete+reinsert pattern)
    MyRecipes.jsx         — User's own recipes with CRUD actions
    MealPlanner.jsx       — Week/day calendar, recipe picker modal, upsert slots
    ExpenseTracker.jsx    — Planned cost + misc expenses per week
    Profile.jsx           — Edit full_name, bio, own recipe grid, logout
    PublicProfile.jsx     — Read-only profile view at /users/:id, shows public recipes

  components/
    common/               — AppLoader, Header, BottomNavigation, FloatingAddButton,
                            EmptyState, ConfirmDialog
    recipe/               — RecipeCard, RecipeCardGrid, CategoryFilter, SearchBar,
                            IngredientList, StepList, CostSummary,
                            StarRating, CommentSection
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
| `ingredients` | Per-recipe: name, quantity, unit, price_per_unit (stores actual price paid) |
| `steps` | Per-recipe: ordered cooking instructions |
| `ratings` | One row per user per recipe, integer 1–5, unique on (recipe_id, user_id) |
| `comments` | User comments on recipes, with body text and profile join |
| `meal_plans` | One row per user per week (keyed by `week_start` date, always Monday) |
| `meal_plan_slots` | One recipe per day+meal_time slot within a plan |
| `expenses` | Misc manual expenses tied to a meal plan week |

### Cost Formula
`price_per_unit` stores the **actual price paid** for the entered quantity (not price per unit).
Cost is computed client-side:
```js
total_cost    = SUM(price_per_unit)           // across all ingredients
cost_per_serving = total_cost / serving_size
```

### Image Storage
Bucket: `recipe-covers` (public)
Upload path: `{user_id}/{timestamp}-{sanitized_filename}`
Filename is sanitized: `coverFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")`
Upload always passes `{ contentType: coverFile.type }` to avoid 400 errors.

---

## Code Patterns

### Data fetching
Direct Supabase calls inside `useEffect` — no caching layer:
```js
useEffect(() => {
  supabase.from('recipes')
    .select('*, profiles(full_name), ingredients(*), ratings(rating)')
    .then(...)
}, []);
```

### Rating upsert
```js
// Insert or update — check for existing row first, then branch
const existing = ratings.find(r => r.user_id === currentUser.id);
if (existing) {
  supabase.from('ratings').update({ rating: star }).eq('id', existing.id)
} else {
  supabase.from('ratings').insert([{ recipe_id, user_id, rating: star }])
}
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

### Profile creation
`Register.jsx` explicitly upserts into `profiles` after `signUp` as a safety net alongside the DB trigger `handle_new_user`.

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

## PWA Setup

Configured with `vite-plugin-pwa`. Icon assets generated from `public/icon.svg` using `@vite-pwa/assets-generator`.

To regenerate icons after changing `icon.svg`:
```bash
npx pwa-assets-generator --config pwa-assets.config.js
```

Generated files (committed to repo, do not edit manually):
- `public/favicon.ico`
- `public/pwa-64x64.png`
- `public/pwa-192x192.png`
- `public/pwa-512x512.png`
- `public/maskable-icon-512x512.png`
- `public/apple-touch-icon-180x180.png`

Workbox strategy: precache all static assets, `NetworkFirst` for Supabase API calls with a 10s timeout.

---

## Deployment

Hosted on Vercel. `vercel.json` rewrites all routes to `index.html` so direct links and refreshes work with React Router:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Without this, Vercel treats the app as a static file server and returns 404 for any route that isn't a real file on disk.

---

## Reference Projects

This app's patterns are modeled after `d:\10_VSC\ReactJS\SpendieClone` — same stack, same CSS conventions, same Supabase integration style. When in doubt, check SpendieClone for reference implementations.
