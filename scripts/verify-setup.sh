#!/bin/bash

echo "================================"
echo "Ping Service Setup Verification"
echo "================================"
echo ""

echo "📁 Checking directory structure..."
REQUIRED_DIRS=(
  "src/domain/ping"
  "src/application/dto"
  "src/application/ports"
  "src/application/services"
  "src/infrastructure/persistence/ping"
  "src/infrastructure/messaging"
  "src/interface/graphql"
  "src/interface/grpc"
  "src/config"
  "src/bootstrap"
  "docker"
)

for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir"
  else
    echo "❌ $dir MISSING"
  fi
done

echo ""
echo "📄 Checking required files..."
REQUIRED_FILES=(
  "package.json"
  "tsconfig.json"
  ".eslintrc.js"
  "vitest.config.ts"
  "pnpm-workspace.yaml"
  "docker/Dockerfile"
  "docker/docker-compose.yaml"
  ".dockerignore"
  ".env.compose"
  "README.md"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file MISSING"
  fi
done

echo ""
echo "📊 Source file counts..."
echo "Domain files: $(find src/domain -type f -name '*.ts' | wc -l)"
echo "Application files: $(find src/application -type f -name '*.ts' | wc -l)"
echo "Infrastructure files: $(find src/infrastructure -type f -name '*.ts' | wc -l)"
echo "Interface files: $(find src/interface -type f -name '*.ts' | wc -l)"
echo "Test files: $(find src -type f -name '*.spec.ts' | wc -l)"
echo "Total: $(find src -type f -name '*.ts' | wc -l)"

echo ""
echo "✅ Setup verification complete!"
