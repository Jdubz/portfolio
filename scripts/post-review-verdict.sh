#!/usr/bin/env bash
# Post the Claude review verdict comment for a commit.
#
# The WORKFLOW posts this, from the model's schema-enforced structured output. The model never
# posts it: if the model were responsible for its own evidence, a skipped or denied comment would
# leave a green check that is indistinguishable from a real review.
#
# Two rules:
#   1. NEVER post a verdict we did not actually receive. If the payload is missing, malformed, or
#      does not satisfy the schema, post NOTHING. No verdict comment for a commit means it was
#      not reviewed.
#   2. The first line is the contract: `## Claude review — <40-char sha>`.
#
# Usage (from the workflow):  PR=.. SHA=.. STRUCTURED=<json> scripts/post-review-verdict.sh
# Env:
#   PR, SHA, STRUCTURED   required
#   DRY_RUN=1             print the comment body instead of posting

set -uo pipefail

PR="${PR:-}"
SHA="${SHA:-}"
STRUCTURED="${STRUCTURED:-}"
GH="$(command -v gh || true)"

warn() {
    echo "::warning title=Claude review produced no verdict::$1"
    echo "   Nothing posted for ${SHA:-<unknown>}. Re-run the review: gh run rerun <run id>"
    exit 0   # advisory: never red-X the PR; the missing comment is the signal
}

[ -n "$PR" ] && [ -n "$SHA" ] || warn "PR/SHA not set."
[ -n "$STRUCTURED" ] || warn "No structured output for $SHA (crashed, cancelled, or silently no-oped)."
jq -e . >/dev/null 2>&1 <<<"$STRUCTURED" || warn "Structured output for $SHA is not valid JSON."

# Validate against the schema the model was given. `jq -r '.verdict'` on `{}` yields the STRING
# "null", which would otherwise post "Found 0 issue(s)" for a review that produced malformed output.
verdict=$(jq -r '.verdict // empty' <<<"$STRUCTURED")
coverage=$(jq -r '.coverage // empty' <<<"$STRUCTURED")
summary=$(jq -r '.summary // empty' <<<"$STRUCTURED")
count=$(jq -r 'if (.issue_count | type) == "number" then .issue_count else "" end' <<<"$STRUCTURED")

case "$verdict" in
    no-issues|issues) ;;
    *) warn "Structured output for $SHA has no valid 'verdict' (got: '${verdict:-<missing>}')." ;;
esac
case "$coverage" in
    full|partial) ;;
    *) warn "Structured output for $SHA has no valid 'coverage' (got: '${coverage:-<missing>}')." ;;
esac
[ -n "$summary" ] || warn "Structured output for $SHA has no 'summary'."

# A clean verdict that also counts issues contradicts itself: refuse it, as the `issues` branch
# below refuses a count of zero. Otherwise findings could be posted under a clean headline.
if [ "$verdict" = "no-issues" ] && jq -e '(.issue_count | type) == "number" and .issue_count != 0' >/dev/null <<<"$STRUCTURED"; then
    warn "Structured output for $SHA says 'no-issues' but issue_count is '$count'."
fi

if [ "$verdict" = "no-issues" ] && [ "$coverage" = "partial" ]; then
    # Never let a partial read pass for a clean review.
    headline="Incomplete review: no issues found, but not every changed file was read."
elif [ "$verdict" = "no-issues" ]; then
    headline="No issues found. Checked for bugs and CLAUDE.md compliance."
else
    # A verdict of "issues" with no positive count is incoherent: refuse it rather than paper over it.
    [ -n "$count" ] && [ "$count" -ge 1 ] 2>/dev/null \
        || warn "Structured output for $SHA says 'issues' but issue_count is '${count:-<missing>}'."
    headline="Found ${count} issue(s) — see the inline comments."
    [ "$coverage" = "full" ] || headline="$headline Not every changed file was read."
fi

body=$(printf '## Claude review — %s\n\n%s\n\n%s\n' "$SHA" "$headline" "$summary")

if [ "${DRY_RUN:-0}" = "1" ]; then
    printf '%s\n' "$body"
    exit 0
fi

# `set -e` is off (the warn() paths must exit 0), so check the post explicitly to keep the log honest.
# The workflow step is `continue-on-error`, so exiting 1 never red-X's the PR.
[ -n "$GH" ] || { echo "::error title=Cannot post verdict::gh not found on PATH"; exit 1; }
if ! "$GH" pr comment "$PR" --body "$body"; then
    echo "::error title=Cannot post verdict::gh pr comment failed for $SHA."
    exit 1
fi
echo "✅ posted verdict ($verdict) for $SHA"
