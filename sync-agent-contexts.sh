#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

find "$SCRIPT_DIR" \
  -type f \
  -name "CLAUDE.md" \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  | while read -r claude_file; do

  dir="$(dirname "$claude_file")"
  agents_file="$dir/AGENTS.md"

  if [ -e "$agents_file" ]; then
    echo "Warning: $agents_file already exists, skipping" >&2
    continue
  fi

  if ln -s "CLAUDE.md" "$agents_file" 2>/dev/null; then
    echo "Created symlink: $agents_file -> CLAUDE.md"
  else
    echo "Warning: Failed to create symlink at $agents_file" >&2
  fi
done
