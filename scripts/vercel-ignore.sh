#!/bin/bash

echo "Checking commit author: $VERCEL_GIT_COMMIT_AUTHOR_LOGIN"

if [[ "$VERCEL_GIT_COMMIT_AUTHOR_LOGIN" == "github-actions[bot]" ]]; then
  echo "✅ Optimized commit from bot detected. Proceeding with build."
  exit 1
else
  echo "🛑 Manual push detected. Ignoring auto-build; GitHub Actions will handle the optimized deploy."
  exit 0
fi
