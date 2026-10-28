#!/usr/bin/env bash
# Posts the Lighthouse and bundle reports as one comment on the pull request,
# or updates that comment if an earlier run already posted it, so each pull
# request has one report that always shows its latest commit. Run by the
# "PR report" job in .github/workflows/ci.yml; see docs/ci.md.
#
# Needs: GH_TOKEN, REPO (owner/name), PR (number), SHA, RUN_URL, and the two
# reports downloaded to reports/lighthouse/report.md and
# reports/bundle/report.md. A missing report (its job crashed before writing
# it) is noted instead.
set -euo pipefail

MARKER='<!-- ci-report -->'

section() {
  local file=$1 title=$2
  if [[ -f $file ]]; then
    cat "$file"
  else
    printf '## %s\n\nNo report: the job stopped before writing it. See the run.\n' "$title"
  fi
}

{
  echo "$MARKER"
  echo "# CI reports"
  echo
  echo "For ${SHA:0:7} · [run details]($RUN_URL) · full HTML reports and treemaps are in the run's artifacts"
  echo
  section reports/lighthouse/report.md Lighthouse
  echo
  section reports/bundle/report.md 'Bundle size'
} >comment.md

existing=$(gh api "repos/$REPO/issues/$PR/comments" --paginate \
  --jq ".[] | select(.user.login == \"github-actions[bot]\" and (.body | startswith(\"$MARKER\"))) | .id" |
  head -n 1)

if [[ -n $existing ]]; then
  gh api -X PATCH "repos/$REPO/issues/comments/$existing" -F body=@comment.md >/dev/null
  echo "Updated comment $existing"
else
  gh api -X POST "repos/$REPO/issues/$PR/comments" -F body=@comment.md >/dev/null
  echo "Posted a new comment"
fi
