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

if [ -z "$SERVICE_KEY" ]; then
    echo "⚠️  WARNING: SERVICE_KEY is empty!"
    exit 1
else
    echo "✅ SERVICE_KEY is set"
fi
echo "===================================="

PAYLOAD=$(jq -n --arg content "$PR_BODY" '{ content: $content }')

curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Service-Key: $SERVICE_KEY" \
  -d "$PAYLOAD" \
  "$TTRAA_URL/api/admin/app-release/on-mr-tagged"

