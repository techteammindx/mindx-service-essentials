#!/bin/bash

SILENT=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --silent)
      SILENT=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

log() {
  if [ "$SILENT" = false ]; then
    echo "$1"
  fi
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

DOCS_FOLDERS=(
  "docs"
  "docs/briefs"
  "docs/notes"
  "docs/guides"
  "docs/investigations"
  "docs/brainstorm"
  "docs/inputs"
)

log "Creating docs folder structure in $SCRIPT_DIR..."

for folder in "${DOCS_FOLDERS[@]}"; do
  folder_path="$SCRIPT_DIR/$folder"

  if [ -d "$folder_path" ]; then
    log "✓ Folder $folder already exists"
  else
    mkdir -p "$folder_path"
    log "✓ Created $folder"
  fi

  # Create .gitkeep file to ensure folder is tracked by git
  touch "$folder_path/.gitkeep"
done

log "✓ Docs structure setup completed"

# Create today's dated sub-folders and symlinks (skip docs/ root folder)
TODAY=$(date +%Y-%m-%d)
log "Creating today's dated folders ($TODAY) and symlinks..."

for folder in "${DOCS_FOLDERS[@]}"; do
  # Skip the root docs folder
  if [ "$folder" = "docs" ]; then
    continue
  fi

  folder_path="$SCRIPT_DIR/$folder"

  # Create today's dated subfolder
  today_folder_path="$folder_path/$TODAY"
  if [ ! -d "$today_folder_path" ]; then
    mkdir -p "$today_folder_path"
    log "✓ Created $folder/$TODAY"
  else
    log "✓ Folder $folder/$TODAY already exists"
  fi

  # Create symlink from 000-current to today's folder
  ln -sfn "$TODAY" "$folder_path/000-current"
  log "✓ Symlinked $folder/000-current -> $folder/$TODAY"
done

log "✓ Today's folder initialization completed"
