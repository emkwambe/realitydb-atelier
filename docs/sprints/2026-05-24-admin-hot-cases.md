# Sprint — Admin role + Hot Cases publish UI

Branch: `claude/review-auth-setup-NGq9M`
Date: 2026-05-24

## Manual migration — run in Supabase SQL Editor

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'learner'
CHECK (role IN ('learner', 'admin'));

CREATE POLICY "hot_cases_admin_all" ON public.hot_cases
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

After the migration, grant Eddy the admin role:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'emkwambe1@gmail.com'
);
```

Sign out and sign back in so the new role lands in the active session.

## What shipped

- `lib/auth/AuthProvider.tsx` — exposes `isAdmin: boolean` derived from
  `profile.role === 'admin'`.
- `lib/hooks/useAuth.ts` — SAFE_DEFAULT includes `isAdmin: false` (role
  was already there).
- `components/layout/SiteHeader.tsx` — appends an "Admin" link to the
  nav when `isAdmin` is true.
- `app/admin/hot-cases/page.tsx` — server component, gated by the
  middleware (`canAccessPath` already restricts `/admin/*` to admin
  role). Lists every `hot_cases` row with status badge and an action
  button per row (Publish / Unpublish / Restore).
- `app/admin/hot-cases/_HotCasesTable.tsx` — client component that
  performs the PATCH and refreshes the list optimistically.
- `app/api/admin/hot-cases/[slug]/route.ts` — `PATCH` accepts
  `{ action: 'publish' | 'unpublish' | 'restore' }`, verifies the
  caller is admin via the user's session + profiles.role lookup, then
  uses the service-role client to update `status` and `published_at`.

## Verification checklist

1. Run the `ALTER TABLE` + `CREATE POLICY` migration in SQL Editor.
2. Run the `UPDATE` to grant your account the admin role.
3. Sign out, sign back in.
4. The nav now shows an "Admin" link.
5. Visit `/admin/hot-cases` — all Hot Cases are listed with status
   badges.
6. Click Publish on a draft — status flips to published, `published_at`
   is set to the current timestamp, the public `/hot-cases` listing
   surfaces it.
7. Sign in as a non-admin account → `/admin/hot-cases` redirects to
   `/auth/unauthorized` via the proxy.
