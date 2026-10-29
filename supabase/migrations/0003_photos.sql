-- 0003: item photos (PLAN.md story 8)
-- Uploaded photos live in a private storage bucket, one folder per user:
--   item-photos/<user id>/<item id>-<random>.jpg
-- Nobody can read the bucket without logging in, and each user can only
-- see and change files inside their own folder.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('item-photos', 'item-photos', false, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Users read their own photos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'item-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users upload to their own folder"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'item-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users delete their own photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'item-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Optional link to a product photo on a store's website, used instead of an upload.
alter table public.items
  add column photo_url text check (photo_url is null or photo_url ~ '^https://');
