#!/bin/bash
# Send MR notification to API
# This script is called from GitHub Actions workflow with PR body content

set -e

PR_BODY="$1"

echo "=== Debug: Environment Variables ==="
echo "TTRAA_URL: $TTRAA_URL"
if [ -z "$TTRAA_URL" ]; then
    echo "⚠️  WARNING: TTRAA_URL is empty!"
    exit 1
else
    echo "✅ TTRAA_URL is set: $TTRAA_URL"
fi
echo "===================================="

PAYLOAD=$(jq -n --arg content "$PR_BODY" '{ content: $content }')

curl -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$TTRAA_URL/api/admin/app-release/on-mr-tagged"

