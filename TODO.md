# TODO

Running list of things to come back to. Decisions with real reasoning go in
DECISIONS.md; this is just the "don't forget" pile.

## Security
- [ ] Set `ssl.rejectUnauthorized: true` in `backend/src/db.js` and supply Supabase's
      root CA cert via a `SUPABASE_CA_CERT` env var. Currently `false`, which encrypts
      but does not verify who is on the other end. Test on a preview deploy first —
      cert verification against the pooler hostname may need fiddling.
- [ ] Decide whether to keep Vercel Deployment Protection on. It currently blocks
      all external requests (curl gets a 302), which is why only the browser works.

## Auth / register
- [ ] Normalize email before insert (lowercase + trim). Postgres UNIQUE is
      case-sensitive, so `Me@Test.com` and `me@test.com` register as two accounts.
- [ ] Enforce a minimum password length. `{"password":"a"}` currently succeeds.
- [ ] Add a login endpoint. Accounts can be created but not authenticated.

## Error handling
- [ ] `auth.js` re-throws non-unique-constraint errors, which become a bare 500 with
      nothing logged. Handle or log them.
- [ ] `todos.js` has no error handling. A bad `user_id` returns an opaque 500 instead
      of a 400 saying the user does not exist (Postgres code 23503).

## Consistency / cleanup
- [ ] `GET /todos` reads the query param as `user-id` (hyphen) while POST bodies use
      `user_id` (underscore). Pick one — underscore is easier to destructure.
- [ ] `migrate:local` and `psql:local` in package.json assume `psql` is installed on
      the host. It is not, so they fail. Either install it or rewrite them to use
      `docker exec`.

## Deployment
- [ ] Connect the Vercel project to the GitHub repo. Right now the app deploys from
      the terminal and migrations deploy from `main`, so production can run code that
      was never committed. (Named as a tradeoff in DECISIONS.md #8.)

## Later
- [ ] Add a migration tracking table once there are more than a handful of migration
      files. Right now nothing records which have run locally.
