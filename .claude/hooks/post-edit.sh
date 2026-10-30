#!/usr/bin/env bash
# PostToolUse(Edit|Write) for the file Claude just edited: eslint at the
# `yarn lint` bar (errors fail). Registered with asyncRewake, so it runs in
# the background and wakes Claude only on exit 2. No formatter: the repo has
# no Prettier. Only files of the session's repository (any of its worktrees:
# the root is taken from the file, not the session).
set -u

file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).tool_input?.file_path??"")}catch{}})')
[ -f "$file" ] || exit 0
dir=$(dirname "$file")
root=$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null) || exit 0
common=$(git -C "$dir" rev-parse --path-format=absolute --git-common-dir 2>/dev/null) || exit 0
project=$(git -C "${CLAUDE_PROJECT_DIR:-}" rev-parse --path-format=absolute --git-common-dir 2>/dev/null) || exit 0
[ "$common" = "$project" ] || exit 0
rel="${file#"$root"/}"
case "$rel" in node_modules/*|.next/*) exit 0 ;; esac
case "$rel" in *.ts|*.tsx|*.js|*.mjs|*.cjs|*.jsx) ;; *) exit 0 ;; esac
cd "$root" || exit 0
[ -x node_modules/.bin/eslint ] || exit 0

# One eslint at a time; a run superseded by a newer edit of the same file
# stays silent.
state="${TMPDIR:-/tmp}/post-edit-lint-$(printf '%s' "$common" | cksum | cut -d' ' -f1)"
mkdir -p "$state" || exit 0
latest="$state/$(printf '%s' "$file" | cksum | cut -d' ' -f1)"
echo $$ >"$latest"
exec 9>"$state/lock"
# Wait well inside the hook's 300 s timeout; past it, give up silently.
if command -v flock >/dev/null; then flock -w 240 9 || exit 0; fi
[ "$(cat "$latest" 2>/dev/null)" = "$$" ] || exit 0
out=$(node_modules/.bin/eslint --quiet --no-warn-ignored "$file" 2>&1)
status=$?
[ "$(cat "$latest" 2>/dev/null)" = "$$" ] || exit 0
# 1 = lint errors; 2 = eslint itself failed, not the edit's fault.
if [ "$status" -eq 1 ]; then
  echo "eslint errors in $rel — fix them before moving on:" >&2
  printf '%s\n' "$out" | head -40 >&2
  exit 2
fi
exit 0
