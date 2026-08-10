# Decision Log

## 1. Frontend and backend in same monorepo
**Date:** 2026-08-10

**Decision:** Keep frontend and backend as separate codebases (distinct folders) within a single monorepo, rather than splitting into separate repositories.

**Reasoning:** Separate folders keep frontend and backend code cleanly split with distinct package.json, build config, and dev servers. Separate repos would add overhead (coordinating changes across repos, managing multiple git remotes) that teaches DevOps/infrastructure lessons, not core backend lessons. One repo, two folders is cleaner for focusing on the backend code itself.
