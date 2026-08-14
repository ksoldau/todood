# Decision Log

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
