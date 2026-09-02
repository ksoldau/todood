# TODO

Running list of things to come back to. Decisions with real reasoning go in
DECISIONS.md; this is just the "don't forget" pile.

## Security

- [ ] `/login` leaks which emails have accounts via response timing. An unknown
      email returns immediately; a known email with a wrong password runs
      `bcrypt.compare` first. Measured locally: ~0.002ms vs ~59ms — visible in a
      single `curl -w %{time_total}`, no statistics needed. Both paths return an
      identical generic 401, so it is only the clock that talks. Fix is to compare
      against a dummy hash on the not-found path, and it must be a real bcrypt call
      — a `setTimeout` just moves the tell.
      Deliberately not fixed yet: `/register` already returns 409 on a duplicate
      (DECISIONS.md #9), which answers the same question in one request, so closing
      this buys nothing today. **Revisit the moment `/register` stops returning 409**
      — i.e. when email verification lands and it goes to a generic 202. Shipping
      that without this puts the leak straight back.
- [ ] Decide sequential integer ids vs UUIDs — **half done.** `users.id` is now
      UUID (migration `20260826133400_alter_to_uuids.sql`), which was the half that
      mattered: user ids are no longer guessable or countable. `todos.id` is still
      SERIAL. Lower stakes now that every todo route filters on the caller's
      `user_id` and a miss falls through to 404, so guessing an id reveals nothing
      — but a user can still infer roughly how many todos exist system-wide from
      the ids they get back. Leave it unless that matters.
- [ ] Set `ssl.rejectUnauthorized: true` in `backend/src/db.js` and supply Supabase's
      root CA cert via a `SUPABASE_CA_CERT` env var. Currently `false`, which encrypts
      but does not verify who is on the other end. Test on a preview deploy first —
      cert verification against the pooler hostname may need fiddling.
- [ ] Decide whether to keep Vercel Deployment Protection on. It currently blocks
      all external requests (curl gets a 302), which is why only the browser works.

## Auth / register

- [ ] Add email verification, if this ever gets real users. Three things land
      together: a verification token + `verified_at` column, a `/verify` endpoint, and
      an email provider with SPF/DKIM set up on a real domain. Only then does
      `/register` go back to a generic 202 for both new and existing addresses — the
      email is what carries the difference ("confirm your account" vs "you already
      have an account, reset your password?"). See DECISIONS.md #9 for why it returns
      409 today.

## Error handling

- [ ] `auth.js` re-throws non-unique-constraint errors. They are logged (Express
      locally, Vercel runtime logs in prod), but the caller gets an opaque 500 with
      nothing actionable. Deliberately left alone for now: the remaining triggers are
      real server-side failures — database unreachable, pool exhausted, schema drift
      (42P01 / 42703), a future NOT NULL column (23502) — where a 500 is the honest
      answer. Revisit if any of them actually start happening.
- [ ] `todos.js` has no error handling. A bad `user_id` returns an opaque 500 instead
      of a 400 saying the user does not exist (Postgres code 23503).

## Consistency / cleanup

- [ ] `GET /todos` reads the query param as `user-id` (hyphen) while POST bodies use
      `user_id` (underscore). Pick one — underscore is easier to destructure.
- [ ] `migrate:local` and `psql:local` in package.json assume `psql` is installed on
      the host. It is not, so they fail. Either install it or rewrite them to use
      `docker exec`.

## Testing

- [ ] There are no automated tests — `npm test` is still the stub that exits 1, and
      every check so far has been curl by hand against a running server. That has
      caught real bugs, but only for whatever was remembered to be re-run, and it
      cannot run before a deploy.
- [ ] Seed the suite from the cases already exercised manually on `/register`: new
      email (201, stored lowercased), duplicate (409, no second row), password under
      8 characters (400), malformed email (400), email over 254 characters (400).
      Those five caught a `res` closure bug, a regex quantifier typo, and a
      double-send — worth locking in so they stay caught.
- [ ] Add the auth-flow cases verified by curl on 2026-08-31, all passing: no token
      (401), valid token (200, only that user's todos), expired token (401), and B
      attempting GET / PATCH / DELETE on A's todo (empty list / 404 / 404). The
      cross-user three are the ones worth automating — they are what prove the
      `AND user_id = $n` clauses bite, and they are invisible with only one user in
      the database. Expired-token needs a token signed with `expiresIn: '-1s'`,
      since it is otherwise the one branch of `requireAuth`'s try/catch that
      nothing reaches for 24 hours.
- [ ] Decide how tests get a database. Options: point at the local Docker Postgres
      and truncate between runs, or spin up a throwaway container per run. The
      migrations in `backend/supabase/migrations` define the schema either way.
- [ ] Run them before deploying. Right now nothing stands between a broken commit
      and production.

## Deployment

- [ ] Connect the Vercel project to the GitHub repo. Right now the app deploys from
      the terminal and migrations deploy from `main`, so production can run code that
      was never committed. (Named as a tradeoff in DECISIONS.md #8.)

## Tooling

- [ ] Migrate to TypeScript. Catch simple bugs.

## Later

- [ ] Add a migration tracking table once there are more than a handful of migration
      files. Right now nothing records which have run locally.
