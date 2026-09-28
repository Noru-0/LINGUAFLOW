#!/bin/bash

# ==============================================================================
# Vercel Ignored Build Step Script (Root)
#
# Vercel build logic:
# - Exit Code 0: SKIPS / CANCELS the build (No redeployment)
# - Exit Code 1: PROCEEDS with the build (Triggers deployment)
# ==============================================================================

echo "--- VERCEL DEPLOYMENT TRIGGER CHECK ---"
echo "Git Ref / Tag   : $VERCEL_GIT_COMMIT_REF"
echo "Git Commit Msg  : $VERCEL_GIT_COMMIT_MESSAGE"

# 1. Check if triggered by a Git Release Tag (e.g. v1.0.0, v2.0.1, etc.)
if [[ "$VERCEL_GIT_COMMIT_REF" =~ ^v[0-9]+\.[0-9]+ ]]; then
  echo "🚀 RELEASE TAG DETECTED ($VERCEL_GIT_COMMIT_REF): Proceeding with Vercel build & deploy."
  exit 1
fi

# 2. Check if triggered by a release branch (e.g. release/v1.0)
if [[ "$VERCEL_GIT_COMMIT_REF" =~ ^release\/ ]]; then
  echo "🚀 RELEASE BRANCH DETECTED ($VERCEL_GIT_COMMIT_REF): Proceeding with Vercel build & deploy."
  exit 1
fi

# 3. Check if commit message indicates a version release
if [[ "$VERCEL_GIT_COMMIT_MESSAGE" =~ ^(release|Release|chore\(release\)|feat\(release\)|v[0-9]) ]] || \
   [[ "$VERCEL_GIT_COMMIT_MESSAGE" == *"[release]"* ]] || \
   [[ "$VERCEL_GIT_COMMIT_MESSAGE" == *"[deploy]"* ]]; then
  echo "🚀 RELEASE COMMIT DETECTED: Proceeding with Vercel build & deploy."
  exit 1
fi

# 4. Default: Standard code edit / bug fix commit -> Skip redeploy
echo "⏸️ CODE EDIT COMMIT DETECTED: Skipping Vercel build. Only releases will redeploy."
exit 0
