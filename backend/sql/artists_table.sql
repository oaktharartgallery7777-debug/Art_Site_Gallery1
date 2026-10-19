-- ABC Art Gallery: artist profile photos
-- Run once in Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to run multiple times (IF NOT EXISTS).

create table if not exists artists (
  name text primary key,
  photo_url text
);
