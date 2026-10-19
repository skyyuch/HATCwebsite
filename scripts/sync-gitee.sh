#!/bin/sh
# Publish the current source tree to the Gitee mirror the dev team deploys from.
#
# Why this is not a plain `git push gitee main`:
#   GitHub `origin/main` carries the full history (33+ commits, ~39.6 MiB of
#   objects, mostly image assets in the first few commits). Gitee's receive-pack
#   deadline cannot absorb that over the owner's ~3-13 KiB/s uplink — two
#   attempts died after 69 and 57 minutes (第五十八輪). The dev team instead
#   imported a zip snapshot as a single unrelated commit on `master`.
#
#   So the mirror is maintained as a *separate lineage*: each sync adds one
#   commit on top of Gitee's `master` whose tree equals the current branch's
#   tree. Only changed blobs travel (the first sync was 18 KiB), and GitHub
#   keeps the real history.
#
# `lp.zip` (4 MB of design references) is excluded — it is not needed to deploy
# and would be the single largest upload in the repo.
#
# Usage: sh scripts/sync-gitee.sh [source-ref]      (default: HEAD)

set -e

REMOTE=gitee
REMOTE_BRANCH=master
LOCAL_MIRROR=gitee-main
EXCLUDE=lp.zip
SOURCE="${1:-HEAD}"

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "[sync-gitee] No '$REMOTE' remote configured." >&2
  exit 1
fi

# Only *tracked* changes matter: the mirror commit is built from `$SOURCE`'s
# tree (see below), so uncommitted edits to tracked files would be silently left
# behind — that is what this guard is for. Untracked files cannot end up in the
# tree at all, so they only warrant a warning; blocking on them meant any
# unrelated scratch folder in the repo root made the mirror un-syncable.
if ! git diff --quiet HEAD -- 2>/dev/null; then
  echo "[sync-gitee] Tracked files have uncommitted changes — commit or stash first." >&2
  echo "             (They would NOT be published: the mirror commit uses $SOURCE's tree.)" >&2
  exit 1
fi

UNTRACKED="$(git ls-files --others --exclude-standard)"
if [ -n "$UNTRACKED" ]; then
  echo "[sync-gitee] Note: untracked files present, they are not part of the mirror:"
  echo "$UNTRACKED" | sed 's/^/               /'
fi

echo "[sync-gitee] Fetching $REMOTE (can take a few minutes on a slow link)…"
git fetch "$REMOTE"

# Build the mirror tree in a scratch index so the real one is never touched.
INDEX="$(mktemp -t hatc-gitee-index)"
rm -f "$INDEX"
cleanup() { rm -f "$INDEX"; }
trap cleanup EXIT INT TERM

TREE="$(
  GIT_INDEX_FILE="$INDEX" sh -c "
    git read-tree '$SOURCE' &&
    git update-index --force-remove '$EXCLUDE' &&
    git write-tree
  "
)"

PARENT="$(git rev-parse "$REMOTE/$REMOTE_BRANCH")"

if [ "$TREE" = "$(git rev-parse "$PARENT^{tree}")" ]; then
  echo "[sync-gitee] $REMOTE/$REMOTE_BRANCH already matches $SOURCE — nothing to push."
  exit 0
fi

SHA="$(git rev-parse --short "$SOURCE")"
COMMIT="$(
  git commit-tree "$TREE" -p "$PARENT" \
    -m "Sync HATC website source ($SHA)

Mirrors GitHub main at $SHA, which carries the full history.
Identical contents except $EXCLUDE (design references, not needed to deploy)."
)"

git branch -f "$LOCAL_MIRROR" "$COMMIT"

SIZE="$(
  git rev-list --objects "$COMMIT" --not "$PARENT" |
    awk '{print $1}' |
    git cat-file --batch-check='%(objectsize:disk)' |
    awk '{s+=$1} END {printf "%.2f MiB", s/1048576}'
)"
echo "[sync-gitee] Pushing $SHA to $REMOTE/$REMOTE_BRANCH (about $SIZE of objects)…"

git push "$REMOTE" "$LOCAL_MIRROR:$REMOTE_BRANCH"
echo "[sync-gitee] Done. Gitee $REMOTE_BRANCH now matches $SOURCE."
