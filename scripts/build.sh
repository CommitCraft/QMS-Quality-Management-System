#!/usr/bin/env bash
set -e

pushd backend >/dev/null
npm run build
popd >/dev/null

pushd frontend >/dev/null
npm run build
popd >/dev/null

echo "Build completed for backend and frontend."
