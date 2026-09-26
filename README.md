# Learn It

Learn It is a Next.js App Router project for learning practical computer skills.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set the Supabase project URL and public anon key in `.env.local`.
4. Apply the profile migration described below.
5. Start the app with `npm run dev`.

Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are used by the app. The publishable key is public; never place a service-role key or other secret in client code or a `NEXT_PUBLIC_` variable.

## Supabase setup

Create a Supabase project, then copy its project URL and publishable key into `.env.local`. Set `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000` for local development.

In Supabase **Authentication → URL Configuration**, set the local Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to the Redirect URLs. For deployment, set `NEXT_PUBLIC_SITE_URL` to the production origin and add its `/auth/callback` URL too. Email confirmation and password recovery both return through this callback.

## Database migration

Run [`supabase/migrations/20260927000000_create_profiles.sql`](supabase/migrations/20260927000000_create_profiles.sql) in the Supabase SQL Editor (or apply it with your Supabase migration workflow). It creates only `public.profiles`, its signup trigger, and the policies/grants required for users to select and update their own profile. The trigger creates a profile row when Supabase Auth creates a user. Passwords remain managed by Supabase Auth.
