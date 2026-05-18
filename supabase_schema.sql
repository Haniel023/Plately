-- ============================================================
-- RecipeBook — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- PROFILES (mirrors auth.users)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null unique,
  avatar_url  text,
  bio         text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);


-- RECIPES
create table public.recipes (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.profiles(id) on delete cascade,
  title         text not null,
  description   text,
  category      text not null check (category in ('Breakfast','Lunch','Dinner','Snack','Dessert')),
  serving_size  int not null default 1,
  cover_url     text,
  is_public     boolean not null default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.recipes enable row level security;

create policy "Public recipes are viewable by everyone"
  on public.recipes for select
  using (is_public = true or author_id = auth.uid());

create policy "Users can insert own recipes"
  on public.recipes for insert
  with check (author_id = auth.uid());

create policy "Users can update own recipes"
  on public.recipes for update
  using (author_id = auth.uid());

create policy "Users can delete own recipes"
  on public.recipes for delete
  using (author_id = auth.uid());


-- INGREDIENTS
create table public.ingredients (
  id              uuid primary key default gen_random_uuid(),
  recipe_id       uuid not null references public.recipes(id) on delete cascade,
  name            text not null,
  quantity        numeric not null,
  unit            text not null,
  price_per_unit  numeric not null default 0,
  sort_order      int not null default 0
);

alter table public.ingredients enable row level security;

create policy "Ingredients viewable if recipe is viewable"
  on public.ingredients for select
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id
        and (r.is_public = true or r.author_id = auth.uid())
    )
  );

create policy "Users can manage own recipe ingredients"
  on public.ingredients for all
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.author_id = auth.uid()
    )
  );


-- STEPS
create table public.steps (
  id          uuid primary key default gen_random_uuid(),
  recipe_id   uuid not null references public.recipes(id) on delete cascade,
  step_number int not null,
  instruction text not null
);

alter table public.steps enable row level security;

create policy "Steps viewable if recipe is viewable"
  on public.steps for select
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id
        and (r.is_public = true or r.author_id = auth.uid())
    )
  );

create policy "Users can manage own recipe steps"
  on public.steps for all
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_id and r.author_id = auth.uid()
    )
  );


-- MEAL PLANS
create table public.meal_plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  week_start  date not null,
  created_at  timestamptz default now(),
  unique (user_id, week_start)
);

alter table public.meal_plans enable row level security;

create policy "Users can manage own meal plans"
  on public.meal_plans for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- MEAL PLAN SLOTS
create table public.meal_plan_slots (
  id            uuid primary key default gen_random_uuid(),
  meal_plan_id  uuid not null references public.meal_plans(id) on delete cascade,
  day_of_week   text not null check (day_of_week in ('Mon','Tue','Wed','Thu','Fri','Sat','Sun')),
  meal_time     text not null check (meal_time in ('Breakfast','Lunch','Dinner')),
  recipe_id     uuid references public.recipes(id) on delete set null,
  unique (meal_plan_id, day_of_week, meal_time)
);

alter table public.meal_plan_slots enable row level security;

create policy "Users can manage own meal plan slots"
  on public.meal_plan_slots for all
  using (
    exists (
      select 1 from public.meal_plans mp
      where mp.id = meal_plan_id and mp.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.meal_plans mp
      where mp.id = meal_plan_id and mp.user_id = auth.uid()
    )
  );


-- EXPENSES
create table public.expenses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  meal_plan_id  uuid references public.meal_plans(id) on delete set null,
  label         text not null,
  amount        numeric not null,
  created_at    timestamptz default now()
);

alter table public.expenses enable row level security;

create policy "Users can manage own expenses"
  on public.expenses for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ====================================================
-- TRIGGER: Auto-create profile row when a new auth user signs up
-- Run this in the SQL Editor so profile creation bypasses RLS
-- (the function runs as SECURITY DEFINER, i.e. as the DB owner)
-- ====================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ====================================================
-- STORAGE: Create bucket 'recipe-covers' in the
-- Supabase Dashboard → Storage → New Bucket
-- Set it as PUBLIC and allow uploads from authenticated users.
-- Or run:
-- ====================================================
-- insert into storage.buckets (id, name, public)
-- values ('recipe-covers', 'recipe-covers', true);

-- Storage policy for recipe-covers:
-- Allow authenticated users to upload to their own folder:
-- CREATE POLICY "Authenticated users can upload covers"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'recipe-covers' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read:
-- CREATE POLICY "Public can view covers"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'recipe-covers');
