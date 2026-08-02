# Wire — Social Feed App

A social feed app: registration, posts, likes, comments, follow/unfollow,
and a personalized feed that updates in real time over WebSockets
(Supabase Realtime, backed by Postgres logical replication).

Stack: Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase
(Postgres, Auth, Storage, Realtime), deployed on Vercel.

## 1. Create the Supabase project

1. Go to https://supabase.com, create a new project.
2. In the SQL Editor, paste and run the contents of `supabase/schema.sql`.
   This creates all tables, Row Level Security policies, the
   auto-profile-on-signup trigger, storage buckets for avatars and post
   images, and enables Realtime on posts/likes/comments/follows.
3. In Project Settings > API, copy the Project URL and the `anon` public key.

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the two values from
step 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run locally

```
npm install
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/signup`.

By default Supabase requires email confirmation for new accounts. For fast
local testing, you can turn that off in Authentication > Providers > Email >
"Confirm email" (toggle off), or just click the confirmation link Supabase
emails you.

## 4. What's implemented

- **Registration/auth** — email + password via Supabase Auth, session
  handled by cookies and refreshed in `middleware.ts`. A profile row is
  auto-created on signup via a Postgres trigger.
- **Posts** — create text posts with an optional image (uploaded to
  Supabase Storage).
- **Likes** — optimistic like/unlike, synced to the `likes` table.
- **Comments** — per-post comment thread, live-updating.
- **Follow/unfollow** — `/discover` lists other users; your home feed
  (`/`) only shows posts from people you follow plus your own.
- **Real-time (WebSockets)** — the feed, likes, and comments all
  subscribe to Supabase Realtime channels (`postgres_changes`), so new
  posts from people you follow, new likes, and new comments appear live
  without a page refresh.

## 5. Deploying to Vercel

1. Push this project to a GitHub repo.
2. Import the repo in Vercel.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables in the
   Vercel project settings.
4. Deploy. No other config needed — Realtime works over WebSockets from
   the browser directly to Supabase, so no custom server is required.

## 6. Next steps toward the app (phase 2)

This backend (Supabase: Auth + Postgres + Storage + Realtime) is shared
by both web and mobile — nothing here is web-only. For the app, scaffold
an Expo/React Native project, reuse `@supabase/supabase-js` with the
Expo-compatible auth storage adapter, and rebuild the screens
(`feed`, `post detail`, `profile`, `discover`) as native components
against the same tables and Realtime channels.

## Project structure

```
app/
  page.tsx                  Home feed (personalized, protected)
  login/page.tsx            Sign in
  signup/page.tsx           Sign up
  discover/page.tsx         Find & follow people
  profile/[username]/page.tsx
  post/[id]/page.tsx        Post detail + comments
components/
  Navbar.tsx
  PostComposer.tsx
  PostCard.tsx
  RealtimeFeed.tsx          WebSocket subscription + live feed rendering
  CommentSection.tsx        WebSocket subscription for comments
  LikeButton.tsx
  FollowButton.tsx
lib/
  supabase/client.ts        Browser Supabase client
  supabase/server.ts        Server component Supabase client
  supabase/middleware.ts    Session refresh + route protection
  data.ts                   Shared data-fetching helpers
  types.ts
supabase/
  schema.sql                Full DB schema, RLS, triggers, storage, realtime
```
