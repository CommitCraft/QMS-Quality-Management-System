#!/usr/bin/env bash
set -e

if [[ -z "$1" ]]; then
  echo "Usage: ./scripts/restore.sh <backup_dir>"
  exit 1
fi

BACKUP_DIR="$1"

if [[ ! -d "$BACKUP_DIR" ]]; then
  echo "Backup directory not found: $BACKUP_DIR"
  exit 1
fi

rm -rf uploads
cp -r "$BACKUP_DIR/uploads" uploads

echo "Uploads restored from $BACKUP_DIR"
