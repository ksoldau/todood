# Decision Log

## 7. Managed Postgres from a third party
**Date:** 2026-08-21

**Decision:** Use Supabase for hosted Postgres instead of running the database on our own server. Skip the intermediate step of putting the database and the application on the same machine. Use only its Postgres — not its Auth, REST, or Storage services (see #5).

**Reasoning:** Database operations — backups, patching, failover, restores — are a separate skill from backend development, and getting them wrong loses data. Letting a vendor own that removes the highest-consequence failure mode from the learning project; self-managing Postgres is still available later as a deliberate exercise. Supabase is the popular choice at small-project scale, where PlanetScale is aimed at production scale we don't have. Running the DB on the app server was considered and skipped: it's a dead-end configuration that has to be undone before any real deployment, so it isn't worth the detour. The tradeoff is that the app now holds database credentials and connects over the network, which makes secrets handling a real concern rather than a theoretical one: the connection string is stored on the server (env vars now, a secrets manager later), never committed, and the connection is TLS-only.

## 6. Raw SQL files for database migrations
**Date:** 2026-08-10

**Decision:** Use raw SQL files for database migrations instead of a migration tool (db-migrate, Knex.js, Sequelize).

**Reasoning:** Raw SQL files are simple and educational — you see exactly what's running, no abstraction layer. Good for a learning project. If automation is needed later, a tool can be added then.

## 5. Basic password authentication
**Date:** 2026-08-10

**Decision:** Implement basic password-based authentication (email + password hash) instead of using off-the-shelf auth services.

**Reasoning:** To learn authentication fundamentals — how password hashing and tokens work. Keeping it educational without spending too much time on it since it doesn't need to be production ready (yet!)

## 4. Express for HTTP framework
**Date:** 2026-08-10

**Decision:** Use Express as the Node.js HTTP framework.

**Reasoning:** Express is the most widely used Node.js framework with the largest community and most tutorials/documentation. Goal is not to learn a new programming language.

## 3. Postgres version 17
**Date:** 2026-08-10

**Decision:** Use Postgres 17 instead of the latest version (18) or an older version.

**Reasoning:** Version 17 is one major version behind current, giving it stability and maturity while not being outdated. EOL is 2029, which is acceptable for a learning project. Pins to a specific version for reproducibility rather than always using `latest`.

## 2. Postgres for database
**Date:** 2026-08-10

**Decision:** Use PostgreSQL instead of MySQL or SQLite.

**Reasoning:** For a learning project focused on backend, Postgres is worth the extra setup because it's the industry standard, so learning it is the best long-term investment. MySQL would work but isn't used as widely in modern backends. SQLite would be simpler but less realistic to production environments. The added complexity of Postgres + Docker is intentional — both are worth learning as part of a real backend education.

## 1. Frontend and backend in same monorepo
**Date:** 2026-08-10

**Decision:** Keep frontend and backend as separate codebases (distinct folders) within a single monorepo, rather than splitting into separate repositories.

**Reasoning:** Separate folders keep frontend and backend code cleanly split with distinct package.json, build config, and dev servers. Separate repos would add overhead (coordinating changes across repos, managing multiple git remotes) that teaches DevOps/infrastructure lessons, not core backend lessons. One repo, two folders is cleaner for focusing on the backend code itself.
