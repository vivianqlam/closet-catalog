-- 0005: Activewear category (issue #33)
-- Workout pieces (leggings, sports bras, tennis skirts) get their own tab
-- instead of crowding Tops and Bottoms. The app reads categories from this
-- table, so no code changes are needed.

insert into public.categories (id, name, sort_order) values
  (7, 'Activewear', 7)
on conflict (id) do nothing;
