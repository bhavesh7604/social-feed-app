-- ============================================================
-- Social Feed App — Supabase schema
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)) || '_' || substr(new.id::text, 1, 4),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- POSTS ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 2000),
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_id_idx on public.posts (author_id);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

create policy "Users can insert their own posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- ---------- LIKES ----------
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists likes_post_id_idx on public.likes (post_id);

alter table public.likes enable row level security;

create policy "Likes are viewable by everyone"
  on public.likes for select
  using (true);

create policy "Users can like posts"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike their own likes"
  on public.likes for delete
  using (auth.uid() = user_id);

-- ---------- COMMENTS ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments (post_id, created_at);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Users can insert their own comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

-- ---------- FOLLOWS ----------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create index if not exists follows_follower_idx on public.follows (follower_id);
create index if not exists follows_following_idx on public.follows (following_id);

alter table public.follows enable row level security;

create policy "Follows are viewable by everyone"
  on public.follows for select
  using (true);

create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- ---------- REALTIME ----------
-- Enable realtime (WebSocket) broadcasts for these tables
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.likes;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.follows;

-- ---------- STORAGE (avatars + post images) ----------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Post images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Users can upload their own post images"
  on storage.objects for insert
  with check (bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- ---------- VIEWS (convenience counts) ----------
create or replace view public.post_stats as
select
  p.id as post_id,
  (select count(*) from public.likes l where l.post_id = p.id) as like_count,
  (select count(*) from public.comments c where c.post_id = p.id) as comment_count
from public.posts p;
