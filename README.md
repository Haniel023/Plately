# Plately

A recipe-sharing web app where you can browse and share recipes, rate and comment on dishes, plan your meals for the week, and track grocery costs — all in one place.

---

## Features

- **Browse Recipes** — Explore public recipes with search and category filters
- **Star Ratings** — Rate recipes 1–5 stars; see average ratings on recipe cards
- **Comments** — Leave tips and feedback on any recipe
- **Public Profiles** — Visit any chef's profile and browse their public recipes
- **Share Recipes** — Create recipes with ingredients, steps, cover photo, and cost tracking
- **Meal Planner** — Assign recipes to a weekly calendar (Breakfast / Lunch / Dinner)
- **Expense Tracker** — See planned meal costs + add misc grocery expenses per week
- **Profile** — Edit your display name and bio, view your own recipe collection

---

## Tech Stack

| Tool | Version |
|---|---|
| React | 19 |
| Vite | 8 |
| react-router-dom | 7 |
| @supabase/supabase-js | 2 |
| lucide-react | latest |
| CSS | Vanilla |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Haniel023/Plately.git
cd Plately
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up the database

Open your Supabase Dashboard → SQL Editor and run the full contents of `supabase_schema.sql`. This creates all tables, RLS policies, and the auto-profile trigger.

### 4. Create the storage bucket

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

### 5. Install and run

```bash
npm install
npm run dev
```

---

## Project Structure

```
src/
  lib/            — Supabase client, constants, helper functions
  pages/          — Full page components (Browse, Login, Planner, etc.)
  components/
    common/       — Header, BottomNavigation, AppLoader, etc.
    recipe/       — RecipeCard, CategoryFilter, CostSummary, StarRating, CommentSection
    form/         — IngredientRow, StepRow, ImageUploader
    planner/      — WeekCalendar, DayColumn, MealSlot
    expenses/     — ExpenseSummaryCard, MiscExpenseList
    modals/       — RecipePickerModal, MiscExpenseModal
```

---

## Database Tables

| Table | Purpose |
|---|---|
| `profiles` | User display name, email, bio |
| `recipes` | Title, category, serving size, cover image |
| `ingredients` | Per-recipe ingredients with actual price paid |
| `steps` | Ordered cooking instructions |
| `ratings` | 1–5 star ratings, one per user per recipe |
| `comments` | User comments on recipes |
| `meal_plans` | One plan per user per week |
| `meal_plan_slots` | Recipe assigned to a day + meal time |
| `expenses` | Misc manual expenses per week |

---

## License

MIT
