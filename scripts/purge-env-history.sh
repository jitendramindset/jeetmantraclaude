#!/usr/bin/env bash
# Purges backend/.env from ALL git history, then force-pushes.
# Run ONCE after rotating all secrets. Takes ~20 minutes on 257 commits.
# Requires: git (built-in), no Python needed.
#
# Usage:
#   bash scripts/purge-env-history.sh
#
# After it completes, ALL collaborators must re-clone the repo.

set -euo pipefail

echo "🔐 Purging backend/.env from git history..."
echo "   This rewrites all 257 commits. ETA ~20 minutes."
echo "   Do NOT interrupt the process."
echo ""

FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch \
  --force \
  --index-filter "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty \
  --tag-name-filter cat \
  -- --all

echo ""
echo "✓ History rewritten. Cleaning up backup refs..."
git for-each-ref --format="%(refname)" refs/original/ | xargs -r git update-ref -d
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✓ Local cleanup complete."
echo ""
echo "Next step — force push to GitHub:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "⚠️  All collaborators must now re-clone:"
echo "   git clone https://github.com/jitendramindset/jeetmantraclaude.git"
echo ""
echo "✓ Done. backend/.env is removed from all history."
