#!/bin/bash

# Claude Code PostToolUse Hook - Log tool executions
# Logs metadata-only information about tool usage to daily log files

# Create logs directory if it doesn't exist
LOGS_DIR=".claude/logs"
mkdir -p "$LOGS_DIR" 2>/dev/null

# Get current date for log file
DATE=$(date +%Y-%m-%d)
LOG_FILE="$LOGS_DIR/$DATE.log"
ERROR_LOG="$LOGS_DIR/hooks-errors.log"

# Function to log errors
log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] pre-tool-log.sh: $1" >> "$ERROR_LOG" 2>/dev/null
}

# Function to truncate string in middle
truncate_middle() {
    local input="$1"
    local max_length=100
    
    if [ ${#input} -le $max_length ]; then
        echo "$input"
        return
    fi
    
    # Start heavy: 70 chars + "..." + 27 chars = 100 total
    local start_chars=70
    local end_chars=27
    local start="${input:0:$start_chars}"
    local end="${input: -$end_chars}"
    echo "${start}...${end}"
}

# Function to format character count with abbreviation
format_char_count() {
    local count="$1"
    
    if [ "$count" -lt 1000 ]; then
        echo "$count"
    elif [ "$count" -lt 1000000 ]; then
        # Convert to k with 1 decimal place
        local k_value=$((count * 10 / 1000))
        local whole=$((k_value / 10))
        local decimal=$((k_value % 10))
        echo "${whole}.${decimal}k"
    else
        # Convert to M with 1 decimal place
        local m_value=$((count * 10 / 1000000))
        local whole=$((m_value / 10))
        local decimal=$((m_value % 10))
        echo "${whole}.${decimal}M"
    fi
}

# Read JSON input from stdin
if ! json_input=$(cat); then
    log_error "Failed to read JSON input from stdin"
    exit 0
fi

# Parse JSON fields using jq
if ! tool_name=$(echo "$json_input" | jq -r '.tool_name // empty' 2>/dev/null); then
    log_error "Failed to parse tool_name from JSON"
    exit 0
fi

if ! session_id=$(echo "$json_input" | jq -r '.session_id // empty' 2>/dev/null); then
    log_error "Failed to parse session_id from JSON"
    exit 0
fi

# Stringify tool_input as compact JSON
if ! tool_input_str=$(echo "$json_input" | jq -c '.tool_input // {}' 2>/dev/null); then
    log_error "Failed to stringify tool_input"
    exit 0
fi

# Stringify tool_response as compact JSON
if ! tool_response_str=$(echo "$json_input" | jq -c '.tool_response // {}' 2>/dev/null); then
    log_error "Failed to stringify tool_response"
    exit 0
fi

# Calculate character counts of raw JSON
input_char_count=${#tool_input_str}
response_char_count=${#tool_response_str}
formatted_input_chars=$(format_char_count "$input_char_count")
formatted_response_chars=$(format_char_count "$response_char_count")

# Truncate the input and response strings
truncated_input=$(truncate_middle "$tool_input_str")
truncated_response=$(truncate_middle "$tool_response_str")

# Create log entry
timestamp=$(date '+%Y-%m-%d %H:%M:%S')
log_entry="$timestamp session=$session_id tool=$tool_name input=$truncated_input input_chars=$formatted_input_chars response=$truncated_response response_chars=$formatted_response_chars"

# Write to log file
if ! echo "$log_entry" >> "$LOG_FILE" 2>/dev/null; then
    log_error "Failed to write to log file: $LOG_FILE"
fi

# Exit successfully (don't block tool execution)
exit 0