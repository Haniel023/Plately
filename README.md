<div align="center">

<img src="public/pwa-192x192.png" width="96" height="96" alt="Plately icon" />

# Plately

**A recipe-sharing app for home cooks.**
Browse community recipes, plan your meals for the week, and track what you spend on groceries — all in one place.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-plately--alpha.vercel.app-e67e22?style=for-the-badge&logo=vercel&logoColor=white)](https://plately-alpha.vercel.app)
&nbsp;
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
&nbsp;
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
&nbsp;
[![Supabase](https://img.shields.io/badge/Supabase-2-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
&nbsp;
[![PWA](https://img.shields.io/badge/PWA-ready-5a0fc8?style=for-the-badge&logo=pwa&logoColor=white)](#)

</div>

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🔍 | **Browse Recipes** | Explore public recipes with live search and category filters |
| ⭐ | **Star Ratings** | Rate recipes 1–5 stars; average shown on every card |
| 💬 | **Comments** | Leave tips and suggestions on any recipe |
| 👤 | **Public Profiles** | Visit any chef's profile and browse their published recipes |
| 📸 | **Share Recipes** | Create recipes with cover photo, ingredients, steps, and cost tracking |
| ✏️ | **Edit & Delete** | Full CRUD on your own recipes |
| 📅 | **Meal Planner** | Drag recipes into a weekly Breakfast / Lunch / Dinner calendar |
| 💰 | **Expense Tracker** | See your planned meal costs + add miscellaneous grocery expenses |
| 📱 | **PWA** | Install to home screen on iOS and Android, works offline |

---

## 🛠️ Tech Stack

| Tool | Version | Role |
|---|---|---|
| [React](https://react.dev) | 19 | UI framework |
| [Vite](https://vite.dev) | 8 | Build tool + dev server |
| [react-router-dom](https://reactrouter.com) | 7 | Client-side routing |
| [@supabase/supabase-js](https://supabase.com/docs/reference/javascript) | 2 | Auth, database, storage |
| [lucide-react](https://lucide.dev) | latest | Icons |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app) | latest | PWA + service worker |
| CSS | Vanilla | Styling (no Tailwind, no CSS-in-JS) |

> State management: plain `useState` / `useEffect`. No Redux, no Zustand, no Context API.

---

## 🚀 Getting Started

### 1 · Clone the repo

```bash
git clone https://github.com/Haniel023/Plately.git
cd Plately
```

### 2 · Set up environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3 · Set up the database

Open **Supabase Dashboard → SQL Editor** and run the full contents of `supabase_schema.sql`.
This creates all 9 tables, RLS policies, and the auto-profile trigger.

### 4 · Create the storage bucket

In **Supabase Dashboard → Storage → New Bucket**:
- Name: `recipe-covers`
- Visibility: **Public**

Then run these three storage policies in the SQL Editor:

```sql
-- Upload: users can only write to their own folder
CREATE POLICY "Users can upload covers" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'recipe-covers'
    AND (storage.foldername(name))[1] = auth.uid()::text);

-- Read: anyone can view cover images
CREATE POLICY "Public can view covers" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'recipe-covers');

-- Delete: users can only remove their own files
CREATE POLICY "Users can delete their own covers" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'recipe-covers'
    AND (storage.foldername(name))[1] = auth.uid()::text);
```

### 5 · Install and run

```bash
npm install
npm run dev
```

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `profiles` | User display name, email, bio — mirrors `auth.users` |
| `recipes` | Title, category, serving size, cover image URL, public flag |
| `ingredients` | Per-recipe ingredients — stores the **actual price paid** for that quantity |
| `steps` | Ordered cooking instructions |
| `ratings` | 1–5 star ratings — one row per user per recipe |
| `comments` | Free-text comments on recipes |
| `meal_plans` | One plan per user per week (keyed by Monday `week_start`) |
| `meal_plan_slots` | One recipe per day + meal-time slot within a plan |
| `expenses` | Miscellaneous manual expenses tied to a meal plan week |

<details>
<summary><strong>Cost formula</strong></summary>

`price_per_unit` stores the actual price paid for the quantity entered — not a unit rate.

```js
total_cost       = SUM(ingredients.price_per_unit)
cost_per_serving = total_cost / serving_size
```

</details>

---

## 📁 Project Structure

```
Plately/
├── public/
│   ├── icon.svg                  ← master SVG icon
│   ├── favicon.ico
│   ├── apple-touch-icon-180x180.png
│   ├── pwa-192x192.png
│   └── pwa-512x512.png
├── src/
│   ├── lib/
│   │   ├── supabaseClient.js     ← Supabase client
│   │   ├── constants.js          ← CATEGORIES, UNITS, DAYS_OF_WEEK …
│   │   └── recipeHelpers.js      ← costPerServing, formatCurrency (₱) …
│   ├── pages/
│   │   ├── Browse.jsx            ← public recipe feed
│   │   ├── RecipeDetail.jsx      ← full view + ratings + comments
│   │   ├── ShareRecipe.jsx       ← create recipe form
│   │   ├── EditRecipe.jsx        ← edit recipe form
│   │   ├── MyRecipes.jsx         ← user's own recipes
│   │   ├── MealPlanner.jsx       ← weekly calendar
│   │   ├── ExpenseTracker.jsx    ← cost summary + misc expenses
│   │   ├── Profile.jsx           ← own profile + recipe grid
│   │   ├── PublicProfile.jsx     ← other users' profiles at /users/:id
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   └── components/
│       ├── common/               ← Header, BottomNavigation, AppLoader …
│       ├── recipe/               ← RecipeCard, StarRating, CommentSection …
│       ├── form/                 ← IngredientRow, StepRow, ImageUploader
│       ├── planner/              ← WeekCalendar, DayColumn, MealSlot …
│       ├── expenses/             ← ExpenseSummaryCard, MiscExpenseList
│       └── modals/               ← RecipePickerModal, MiscExpenseModal
├── supabase_schema.sql           ← full DB schema — run once in Supabase
├── pwa-assets.config.js          ← icon generation config
└── vercel.json                   ← SPA rewrite rule for Vercel
```

---

## ☁️ Deployment

The app is deployed on **Vercel**. All routes are rewritten to `index.html` via `vercel.json` so direct links and page refreshes work correctly.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

To deploy your own instance: import the repo in [vercel.com](https://vercel.com), add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables, and deploy.

---

## 📱 PWA — Install to Home Screen

Plately is a full PWA. On mobile:

- **Android (Chrome):** tap the browser menu → *Add to Home Screen*
- **iOS (Safari):** tap the Share button → *Add to Home Screen*

Once installed, the app opens in standalone mode (no browser chrome) with the Plately icon.

---

## 📄 License

MIT
