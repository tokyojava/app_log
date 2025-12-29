#!/bin/bash
# Send MR notification to API
# This script is called from GitHub Actions workflow with PR body content

set -e

PR_BODY="$1"

echo "=== Debug: Environment Variables ==="
echo "TTRAA_URL: $TTRAA_URL"
echo "PR_NUMBER: $PR_NUMBER"
echo "PR_URL: $PR_URL"

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

PAYLOAD=$(jq -n \
    --arg content "$PR_BODY" \
    --arg pr_number "$PR_NUMBER" \
    --arg pr_url "$PR_URL" \
    '{ content: $content, pr_number: $pr_number, pr_url: $pr_url }')

curl -X POST \
  -H "Content-Type: application/json" \
  -H "service-key: $SERVICE_KEY" \
  -d "$PAYLOAD" \
  "$TTRAA_URL/api/admin/app-release/on-mr-tagged"

