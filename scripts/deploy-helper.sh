#!/usr/bin/env bash
set -e

echo "Running deployment helper checks..."

if [[ ! -d backend/node_modules || ! -d frontend/node_modules ]]; then
  echo "Dependencies missing. Run npm install in backend and frontend first."
  exit 1
fi

./scripts/build.sh

echo "Deployment helper completed."
