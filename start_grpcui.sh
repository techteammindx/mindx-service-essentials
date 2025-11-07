#!/bin/bash

if command -v "grpcui" >/dev/null 2>/dev/null; then
  grpcui -plaintext localhost:7777
else
  echo "grpcui is NOT installed, run 'brew install grpcui' or check out https://github.com/fullstorydev/grpcui"
fi
