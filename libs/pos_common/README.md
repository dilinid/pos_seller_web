# pos_common

Shared config, DB access, JWT verification, and SQLModel table definitions used by
every pos_seller_web backend service (`services/core`, `services/ordering`,
`services/picking`, `services/packing`).

## Why this exists

The `pos_*` tables are owned by an external legacy in-store POS application that
writes to them directly, outside this repo. True database-per-service isn't
achievable without migrating that system too (out of scope), so all services share
one physical MySQL instance. Table ownership here is **logical**, not physically
enforced:

- Each model module below has a one-line `Owned by: <service>` docstring.
- Only the owning service's code may write that table.
- Every other service must call the owning service's public (or `/internal/*`) API
  instead of writing the table directly, even though nothing at the database level
  stops it from doing so.
- This is a **code-review convention**, not a DB-enforced rule. A stronger
  mitigation (per-service MySQL users with `GRANT SELECT`-only on non-owned tables)
  is a good hardening step once ownership stabilizes, not required for Phase 1.

## Install

Each service installs this package in editable mode from its Dockerfile /
requirements, e.g.:

```
pip install -e /libs/pos_common
```

Docker build contexts for each service must be the repo root (not the service
subdirectory) so the Dockerfile's `COPY libs/pos_common ...` step can reach it.

## Layout

- `config.py` — shared `Settings` fields (DB connection, JWT, CORS, internal
  service token). Each service reads only the env vars relevant to it.
- `database.py` — SQLAlchemy engine + `get_session()` dependency. `init_db()`
  only ever creates/touches tables for the models a given service actually
  imported (SQLModel's metadata registry is scoped to what's imported in-process).
- `auth.py` — `TokenClaims`, `decode_token()`, `get_current_user` dependency
  (local JWT verification, no DB lookup), `require_internal_token` (guards
  `/internal/*` endpoints with a shared-secret bearer token).
- `seller_utils.py` — small helpers used by the fulfillment services
  (`get_store_id`, `get_customer_name`, `staff_code`, `staff_display_name`).
- `http_client.py` — synchronous internal-call helper with a shared
  timeout/retry policy for service-to-service calls (e.g. Picking → Ordering).
- `models/` — the 24 SQLModel table classes.
