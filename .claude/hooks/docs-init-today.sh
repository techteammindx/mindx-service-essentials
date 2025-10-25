#!/bin/bash
DATE=$(date +%Y-%m-%d)
cd docs/ 2>/dev/null || exit 0
for dir in */; do
    mkdir -p "${dir}${DATE}" 2>/dev/null
    ln -sfn "${DATE}" "${dir}000-current"
done