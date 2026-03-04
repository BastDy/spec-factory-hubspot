#!/bin/bash
# Deploy script for Data Quality Card V3
# Usage: ./deploy.sh [--dev|--upload]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Data Quality Card V3 — Deployment ==="

# Check hs CLI
if ! command -v hs &> /dev/null; then
  echo "ERROR: HubSpot CLI (hs) not found. Install: npm install -g @hubspot/cli"
  exit 1
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run tests
echo "Running tests..."
npm test

# Run lint
echo "Running lint..."
npm run lint

MODE="${1:---upload}"

case "$MODE" in
  --dev)
    echo "Starting local development server..."
    hs project dev
    ;;
  --upload)
    echo "Uploading project to HubSpot..."
    hs project upload
    echo "Upload complete."
    ;;
  *)
    echo "Usage: ./deploy.sh [--dev|--upload]"
    exit 1
    ;;
esac
