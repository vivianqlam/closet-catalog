-- 0002: closet data model (PLAN.md §3)
-- categories → items (one-to-many), users → items / trips (one-to-many),
-- trips ↔ items through trip_items, users ↔ items through stars.
-- Row Level Security is on for every table: you only ever see your own rows.

-- ── categories: one shared, pre-filled list ─────────────────────────────
create table public.categories (
  id smallint primary key,
  name text not null unique,
  sort_order smallint not null
);

insert into public.categories (id, name, sort_order) values
  (1, 'Tops', 1),
  (2, 'Bottoms', 2),
  (3, 'Dresses', 3),
  (4, 'Outerwear', 4),
  (5, 'Shoes', 5),
  (6, 'Accessories', 6);

alter table public.categories enable row level security;

create policy "Anyone can read categories"
  on public.categories for select
  using (true);

-- ── items: one row per piece of clothing ────────────────────────────────
create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  category_id smallint not null references public.categories (id),
  name text not null check (char_length(trim(name)) > 0),
  color text,
  season text not null check (season in ('spring', 'summer', 'fall', 'winter', 'all-season')),
  formality text check (formality in ('casual', 'smart casual', 'business', 'formal')),
  brand text,
  notes text,
  photo_path text,
  times_worn integer not null default 0 check (times_worn >= 0),
  last_worn_on date,
  created_at timestamptz not null default now()
);

create index items_user_id_idx on public.items (user_id);

alter table public.items enable row level security;

create policy "Users manage their own items"
  on public.items for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ── trips ───────────────────────────────────────────────────────────────
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  destination text,
  start_date date,
  end_date date,
  climate text check (climate in ('hot', 'warm', 'mild', 'cold', 'snow')),
  trip_type text,
  is_shared boolean not null default false,
  share_token text unique,
  created_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create index trips_user_id_idx on public.trips (user_id);

alter table public.trips enable row level security;

create policy "Users manage their own trips"
  on public.trips for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ── trip_items: which items are packed for which trip (many-to-many) ────
create table public.trip_items (
  trip_id uuid not null references public.trips (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete cascade,
  packed boolean not null default false,
  primary key (trip_id, item_id)
);

create index trip_items_item_id_idx on public.trip_items (item_id);

alter table public.trip_items enable row level security;

-- You can only link your own trip to your own item.
create policy "Users manage items on their own trips"
  on public.trip_items for all
  using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = (select auth.uid()))
  )
  with check (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = (select auth.uid()))
    and exists (select 1 from public.items i where i.id = item_id and i.user_id = (select auth.uid()))
  );

-- ── stars: "this user starred this item" (one table for everyone) ───────
create table public.stars (
  user_id uuid not null default auth.uid() references public.users (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create index stars_item_id_idx on public.stars (item_id);

alter table public.stars enable row level security;

create policy "Users see their own stars"
  on public.stars for select
  using ((select auth.uid()) = user_id);

create policy "Users star their own items"
  on public.stars for insert
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.items i where i.id = item_id and i.user_id = (select auth.uid()))
  );

create policy "Users unstar their own stars"
  on public.stars for delete
  using ((select auth.uid()) = user_id);
