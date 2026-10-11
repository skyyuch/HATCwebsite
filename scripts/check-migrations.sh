#!/bin/sh
# HATC migration drift gate.
#
# Fails when the Payload config describes a database schema that no committed
# migration produces — i.e. someone added/changed/removed a collection, global
# or field without running `npm run migrate:create <name>`.
#
# Why this exists: local development relies on Drizzle `push`, which silently
# syncs the dev database and leaves no trace in the repo. Production never
# pushes, it only replays `src/migrations/*`. Three rounds of schema changes
# accumulated unmigrated that way before this gate was added.
#
# `payload migrate:create` diffs the config against the newest snapshot JSON in
# the migrations directory, so this needs neither a database (the CLI passes
# `disableDBConnect`) nor a TTY (with no stdin the "create a blank migration?"
# prompt cancels and exits 0 without writing anything).

set -e

MIGRATION_DIR="src/migrations"
PROBE_NAME="__drift_check__"

if [ ! -d "$MIGRATION_DIR" ]; then
  echo "[migrate:check] No $MIGRATION_DIR directory. Create the baseline with:" >&2
  echo "                npm run migrate:create -- initial" >&2
  exit 1
fi

# Keep the probe out of the committed migration chain no matter how we exit.
# Creating a migration also rewrites index.ts, so that has to be restored too —
# otherwise it keeps importing the deleted probe and breaks the build.
INDEX_BACKUP="$(mktemp)"
cp "$MIGRATION_DIR/index.ts" "$INDEX_BACKUP"
cleanup() {
  rm -f "$MIGRATION_DIR"/*"$PROBE_NAME"*
  cp "$INDEX_BACKUP" "$MIGRATION_DIR/index.ts"
  rm -f "$INDEX_BACKUP"
}
trap cleanup EXIT INT TERM

# PAYLOAD_SECRET is only needed to satisfy config validation; no DB is touched.
DATABASE_URI='' PAYLOAD_SECRET="${PAYLOAD_SECRET:-migrate-check-placeholder}" \
  npx payload migrate:create "$PROBE_NAME" < /dev/null > /tmp/hatc-migrate-check.log 2>&1 || {
    echo "[migrate:check] payload migrate:create failed:" >&2
    tail -20 /tmp/hatc-migrate-check.log >&2
    exit 1
  }

if ls "$MIGRATION_DIR"/*"$PROBE_NAME"* >/dev/null 2>&1; then
  echo "[migrate:check] Schema drift: the Payload config needs a migration that is not committed." >&2
  echo "                Generate and commit it with:" >&2
  echo "                  npm run migrate:create -- <descriptive_name>" >&2
  echo "                Then run it against any existing database: npm run migrate" >&2
  exit 1
fi

echo "[migrate:check] No schema drift — committed migrations match the Payload config."
