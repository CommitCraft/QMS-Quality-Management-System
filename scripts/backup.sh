#!/usr/bin/env bash
set -e

STAMP=$(date +%Y%m%d_%H%M%S)
TARGET_DIR="backups/$STAMP"
mkdir -p "$TARGET_DIR"

cp -r uploads "$TARGET_DIR/uploads"
cp schema.sql "$TARGET_DIR/schema.sql"

echo "Backup created at $TARGET_DIR"
