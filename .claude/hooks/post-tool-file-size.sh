#!/bin/bash

# Claude Code PostToolUse Hook - File Size Monitor
# Monitors TypeScript file sizes and warns Claude to split large files

# Configuration
CONFIG_FILE=".claude/hooks/file-size-config.json"
ERROR_LOG=".claude/logs/hooks-errors.log"
DEFAULT_THRESHOLD=500

# Function to log errors
log_error() {
    mkdir -p "$(dirname "$ERROR_LOG")" 2>/dev/null
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] post-tool-file-size.sh: $1" >> "$ERROR_LOG" 2>/dev/null
}

# Read JSON input from stdin
if ! json_input=$(cat); then
    log_error "Failed to read JSON input from stdin"
    exit 0
fi

# Parse tool_name
if ! tool_name=$(echo "$json_input" | jq -r '.tool_name // empty' 2>/dev/null); then
    log_error "Failed to parse tool_name from JSON"
    exit 0
fi

# Only process Write and Edit tools
if [[ "$tool_name" != "Write" ]] && [[ "$tool_name" != "Edit" ]]; then
    exit 0
fi

# Parse file_path from tool_input
if ! file_path=$(echo "$json_input" | jq -r '.tool_input.file_path // empty' 2>/dev/null); then
    log_error "Failed to parse file_path from tool_input"
    exit 0
fi

# Skip if no file_path
if [ -z "$file_path" ]; then
    exit 0
fi

# Check file extension (only .ts and .tsx)
if [[ ! "$file_path" =~ \.tsx?$ ]]; then
    exit 0
fi

# Check if file exists
if [ ! -f "$file_path" ]; then
    exit 0
fi

# Count lines
if ! line_count=$(wc -l < "$file_path" 2>/dev/null); then
    log_error "Failed to count lines in $file_path"
    exit 0
fi

# Remove leading/trailing whitespace
line_count=$(echo "$line_count" | tr -d '[:space:]')

# Function to match glob pattern
match_glob() {
    local pattern="$1"
    local path="$2"

    # Convert glob pattern to regex
    # 1. Replace {a,b} with (a|b) for brace expansion
    # 2. Escape dots
    # 3. Replace ** with a placeholder first
    # 4. Replace single * with [^/]*
    # 5. Replace placeholder back to .*
    local regex=$(echo "$pattern" | \
        sed 's/{/(/g' | \
        sed 's/}/)/g' | \
        sed 's/,/|/g' | \
        sed 's/\./\\./g' | \
        sed 's/\*\*/DOUBLESTAR/g' | \
        sed 's/\*/[^\/]*/g' | \
        sed 's/DOUBLESTAR/.*/g')

    [[ "$path" =~ ^$regex$ ]]
}

# Get threshold from config file
get_threshold() {
    local path="$1"
    local threshold="$DEFAULT_THRESHOLD"

    # Check if config file exists
    if [ ! -f "$CONFIG_FILE" ]; then
        log_error "Config file not found: $CONFIG_FILE, using default threshold: $DEFAULT_THRESHOLD"
        echo "$threshold"
        return
    fi

    # Read config and find matching pattern (first match wins)
    local patterns_count=$(jq -r '.patterns | length' "$CONFIG_FILE" 2>/dev/null)
    if [ -z "$patterns_count" ] || [ "$patterns_count" = "null" ]; then
        log_error "Failed to parse patterns from config file, using default threshold: $DEFAULT_THRESHOLD"
        echo "$threshold"
        return
    fi

    for ((i=0; i<patterns_count; i++)); do
        local pattern=$(jq -r ".patterns[$i].glob" "$CONFIG_FILE" 2>/dev/null)
        local pattern_threshold=$(jq -r ".patterns[$i].threshold" "$CONFIG_FILE" 2>/dev/null)

        if [ -n "$pattern" ] && [ "$pattern" != "null" ] && [ -n "$pattern_threshold" ] && [ "$pattern_threshold" != "null" ]; then
            if match_glob "$pattern" "$path"; then
                threshold="$pattern_threshold"
                break
            fi
        fi
    done

    echo "$threshold"
}

# Get threshold for this file
THRESHOLD=$(get_threshold "$file_path")

# Check if line count exceeds threshold
if [ "$line_count" -lt "$THRESHOLD" ]; then
    exit 0
fi

# Prepare logging directory
LOG_FILE=".claude/hooks/logs/oversized-files.jsonl"
mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null

# Create new record
record=$(jq -n \
    --arg path "$file_path" \
    --argjson lines "$line_count" \
    --argjson threshold "$THRESHOLD" \
    --arg tool "$tool_name" \
    --arg recordedAt "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" \
    '{path: $path, lines: $lines, threshold: $threshold, tool: $tool, recordedAt: $recordedAt}' 2>/dev/null)

if [ -z "$record" ]; then
    log_error "Failed to create log record for $file_path"
    exit 0
fi

# Merge with existing records and ensure uniqueness by path (latest wins)
tmp_file=$(mktemp 2>/dev/null)
if [ -z "$tmp_file" ]; then
    log_error "Failed to create temporary file for logging"
    exit 0
fi

{
    if [ -f "$LOG_FILE" ]; then
        cat "$LOG_FILE"
    fi
    echo "$record"
} | jq -s 'group_by(.path) | map(.[-1])[]' 2>/dev/null > "$tmp_file"

if [ $? -ne 0 ]; then
    log_error "Failed to merge log records for $file_path"
    rm -f "$tmp_file" 2>/dev/null
    exit 0
fi

mv "$tmp_file" "$LOG_FILE" 2>/dev/null || {
    log_error "Failed to update log file $LOG_FILE"
    rm -f "$tmp_file" 2>/dev/null
    exit 0
}

# Return concise system message
context_msg="Oversized file logged: $file_path ($line_count lines, threshold $THRESHOLD). Log path: $LOG_FILE."

cat <<EOF
{
  "systemMessage": "$context_msg"
}
EOF

exit 0
