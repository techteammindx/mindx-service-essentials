#!/bin/bash

# Symbol palette for status line markers
MODEL_MARKER=$'●'
DIR_MARKER=$'■'
BRANCH_MARKER=$' ♣ '
TOKEN_MARKER=$'♦'

# Read JSON payload from Claude Code status line
input=$(cat)

if ! command -v jq >/dev/null 2>&1; then
  echo "[statusline] jq missing"
  exit 0
fi

MODEL_DISPLAY=$(echo "$input" | jq -r '.model.display_name // "Claude"')
CURRENT_DIR=$(echo "$input" | jq -r '.workspace.current_dir // ""')
TRANSCRIPT_PATH=$(echo "$input" | jq -r '.transcript_path // ""')

# Git branch indicator (optional)
GIT_BRANCH=""
if git rev-parse --git-dir >/dev/null 2>&1; then
  BRANCH=$(git branch --show-current 2>/dev/null)
  if [ -n "$BRANCH" ]; then
    GIT_BRANCH="${BRANCH_MARKER}${BRANCH}"
  fi
fi

# Resolve warning fraction from environment (default 0.8)
WARN_DEFAULT="0.8"
WARN_FRACTION="$WARN_DEFAULT"
WARN_ENV_NOTE=""

if [ -n "${CLAUDE_USAGE_WARN_FRACTION:-}" ]; then
  if printf '%s' "$CLAUDE_USAGE_WARN_FRACTION" | grep -Eq '^[0-9]*\.?[0-9]+$'; then
    if awk "BEGIN{val=$CLAUDE_USAGE_WARN_FRACTION; if (val >= 0 && val <= 1) exit 0; else exit 1}" >/dev/null 2>&1; then
      WARN_FRACTION="$CLAUDE_USAGE_WARN_FRACTION"
    else
      WARN_ENV_NOTE=" [env-reset]"
    fi
  else
    WARN_ENV_NOTE=" [env-reset]"
  fi
fi

CONTEXT_LIMIT=200000
CAUTION_FRACTION=0.6

usage_available=0
total_tokens=0
token_note=""

if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
  total_tokens=$(jq -s '
    [ .[] | select(.type == "assistant" and (.message.usage | type == "object")) ]
    | if length == 0 then 0 else
        (.[-1].message.usage.input_tokens // 0)
        + (.[-1].message.usage.cache_creation_input_tokens // 0)
        + (.[-1].message.usage.cache_read_input_tokens // 0)
      end
  ' "$TRANSCRIPT_PATH" 2>/dev/null)

  if printf '%s' "$total_tokens" | grep -Eq '^[0-9]+$'; then
    usage_available=1
  else
    total_tokens=0
    token_note=" [usage?]"
  fi
fi

if [ "$usage_available" -eq 1 ]; then
  read -r percentage status_label <<EOF
$(awk -v t="$total_tokens" -v limit="$CONTEXT_LIMIT" -v warn="$WARN_FRACTION" -v caution="$CAUTION_FRACTION" '
  BEGIN {
    if (limit <= 0) {
      printf("0.0 OK\n");
      exit;
    }
    ratio = t / limit;
    pct = ratio * 100;
    status = "OK";
    if (ratio >= warn) {
      status = "HIGH";
    } else if (ratio >= caution) {
      status = "WARN";
    }
    printf("%.1f %s\n", pct, status);
  }
')
EOF
else
  percentage="--"
  status_label="NA"
fi

token_display=$(awk -v t="$total_tokens" 'BEGIN {
  if (t >= 1000000) {
    printf("%.1fM", t/1000000);
  } else if (t >= 1000) {
    printf("%.1fK", t/1000);
  } else {
    printf("%d", t);
  }
}')

if [ "$token_display" = "0.0K" ]; then
  token_display="0"
fi

if [ "$usage_available" -ne 1 ]; then
  token_display="--"
fi

perc_display="$percentage"
if [ "$perc_display" != "--" ]; then
  if printf '%s' "$perc_display" | grep -Eq '^\.'; then
    perc_display="0$perc_display"
  fi
  perc_display="$perc_display%"
fi

RESET=$'\033[0m'
YELLOW=$'\033[33m'
RED=$'\033[31m'

if [ -n "${NO_COLOR:-}" ]; then
  RESET=""
  GREEN=""
  YELLOW=""
  RED=""
fi

perc_colored="$perc_display"
case "$status_label" in
  HIGH)
    perc_colored="${RED}${perc_display}${RESET}";;
  WARN)
    perc_colored="${YELLOW}${perc_display}${RESET}";;
esac

echo "${MODEL_MARKER} ${MODEL_DISPLAY} ${DIR_MARKER} ${CURRENT_DIR##*/}$GIT_BRANCH ${TOKEN_MARKER} $token_display ($perc_colored)$WARN_ENV_NOTE$token_note"
