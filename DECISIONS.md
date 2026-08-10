# Decision Log

## 2. Postgres for database
**Date:** 2026-08-10

**Decision:** Use PostgreSQL instead of MySQL or SQLite.

**Reasoning:** For a learning project focused on backend, Postgres is worth the extra setup because it's the industry standard, so learning it is the best long-term investment. MySQL would work but isn't used as widely in modern backends. SQLite would be simpler but less realistic to production environments. The added complexity of Postgres + Docker is intentional — both are worth learning as part of a real backend education.

## 1. Frontend and backend in same monorepo
**Date:** 2026-08-10

**Decision:** Keep frontend and backend as separate codebases (distinct folders) within a single monorepo, rather than splitting into separate repositories.

**Reasoning:** Separate folders keep frontend and backend code cleanly split with distinct package.json, build config, and dev servers. Separate repos would add overhead (coordinating changes across repos, managing multiple git remotes) that teaches DevOps/infrastructure lessons, not core backend lessons. One repo, two folders is cleaner for focusing on the backend code itself.
