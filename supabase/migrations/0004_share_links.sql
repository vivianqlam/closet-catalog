-- 0004: read-only share links for trips (PLAN.md story 10)
-- The privacy rules from 0002 still hide every trip and item from anyone who
-- isn't the owner. A share link works through one narrow door instead:
-- get_shared_trip() returns a single trip's list, and only when that trip has
-- sharing turned on AND the caller knows its secret token.

create function public.get_shared_trip(token text)
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'name', t.name,
    'destination', t.destination,
    'start_date', t.start_date,
    'end_date', t.end_date,
    'climate', t.climate,
    'trip_type', t.trip_type,
    'items', coalesce((
      -- Only what a friend needs to see: no notes, wear counts or other trips.
      select json_agg(json_build_object(
          'id', i.id,
          'name', i.name,
          'category', c.name,
          'color', i.color,
          'brand', i.brand,
          'photo_path', i.photo_path,
          'photo_url', i.photo_url
        ) order by c.sort_order, i.name)
      from public.trip_items ti
      join public.items i on i.id = ti.item_id
      join public.categories c on c.id = i.category_id
      where ti.trip_id = t.id
    ), '[]'::json)
  )
  from public.trips t
  where t.is_shared and t.share_token = token and length(token) >= 20;
$$;

revoke all on function public.get_shared_trip(text) from public;
grant execute on function public.get_shared_trip(text) to anon, authenticated;

-- Photos stay in the private bucket. A photo can be opened by someone other
-- than its owner only while it's on a trip that has sharing turned on.
create function public.is_shared_photo(path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.items i
    join public.trip_items ti on ti.item_id = i.id
    join public.trips t on t.id = ti.trip_id
    where i.photo_path = path and t.is_shared
  );
$$;

revoke all on function public.is_shared_photo(text) from public;
grant execute on function public.is_shared_photo(text) to anon, authenticated;

create policy "Anyone can read photos on shared trips"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'item-photos' and public.is_shared_photo(name));
