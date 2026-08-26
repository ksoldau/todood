# TODO

Running list of things to come back to. Decisions with real reasoning go in
DECISIONS.md; this is just the "don't forget" pile.

## Security
- [ ] `GET /todos` takes `user-id` straight from the query string with no
      authentication, so anyone can read anyone's todos by guessing an id — and ids
      are sequential integers, so guessing is trivial. Same for POST/PATCH/DELETE.
      The fix is not to hide the id: the server should know who the caller is from a
      session or token, and `user_id` should come from that, never from the request.
      Blocked on the login endpoint.
- [ ] Decide sequential integer ids vs UUIDs. SERIAL leaks the user count (id 47
      means roughly 47 users) and makes enumeration easy. Worth settling before
      there is data to migrate.
- [ ] Set `ssl.rejectUnauthorized: true` in `backend/src/db.js` and supply Supabase's
      root CA cert via a `SUPABASE_CA_CERT` env var. Currently `false`, which encrypts
      but does not verify who is on the other end. Test on a preview deploy first —
      cert verification against the pooler hostname may need fiddling.
- [ ] Decide whether to keep Vercel Deployment Protection on. It currently blocks
      all external requests (curl gets a 302), which is why only the browser works.

## Auth / register
- [ ] Add a login endpoint. Accounts can be created but not authenticated.
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
- [ ] Decide how tests get a database. Options: point at the local Docker Postgres
      and truncate between runs, or spin up a throwaway container per run. The
      migrations in `backend/supabase/migrations` define the schema either way.
- [ ] Run them before deploying. Right now nothing stands between a broken commit
      and production.

## Deployment
- [ ] Connect the Vercel project to the GitHub repo. Right now the app deploys from
      the terminal and migrations deploy from `main`, so production can run code that
      was never committed. (Named as a tradeoff in DECISIONS.md #8.)

## Later
- [ ] Add a migration tracking table once there are more than a handful of migration
      files. Right now nothing records which have run locally.
