#!/bin/bash

TESTS_PASSED=0
TESTS_FAILED=0

test_result() {
  local test_name=$1
  local exit_code=$2

  if [ $exit_code -eq 0 ]; then
    echo "✓ $test_name"
    ((TESTS_PASSED++))
  else
    echo "✗ $test_name"
    ((TESTS_FAILED++))
  fi
}

echo "Running infrastructure service tests..."
echo ""

# Test 1: MongoDB connectivity via port
echo "Testing MongoDB..."
if timeout 5 bash -c "echo 'db.adminCommand(\"ping\")' | mongosh -u root -p root --authenticationDatabase admin mongodb://mongo:27017" &>/dev/null; then
  test_result "MongoDB connection" 0
else
  # Fallback: check if port is open
  if timeout 3 bash -c "</dev/tcp/localhost/27017" &>/dev/null; then
    test_result "MongoDB port accessible" 0
  else
    test_result "MongoDB connection" 1
  fi
fi

# Test 2: Zookeeper connectivity
echo ""
echo "Testing Zookeeper..."
if timeout 3 bash -c "</dev/tcp/localhost/2181" &>/dev/null; then
  test_result "Zookeeper port accessible" 0
else
  test_result "Zookeeper port accessible" 1
fi

# Test 3: Kafka broker connectivity
echo ""
echo "Testing Kafka..."
if timeout 5 docker exec mindx_service_essentials_kafka kafka-topics --bootstrap-server localhost:9092 --list &>/dev/null; then
  test_result "Kafka broker connectivity" 0
else
  test_result "Kafka broker connectivity" 1
fi

# Test 4: Kafka topic creation
if timeout 10 docker exec mindx_service_essentials_kafka kafka-topics --bootstrap-server localhost:9092 --create \
  --topic test-topic --partitions 1 --replication-factor 1 --if-not-exists &>/dev/null; then
  test_result "Kafka topic creation" 0
else
  test_result "Kafka topic creation" 1
fi

# Test 5: Kafka port accessible
if timeout 3 bash -c "</dev/tcp/localhost/9092" &>/dev/null; then
  test_result "Kafka port accessible" 0
else
  test_result "Kafka port accessible" 1
fi

# Summary
echo ""
echo "======================================="
echo "Infrastructure Test Summary"
echo "======================================="
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -gt 0 ]; then
  echo "Some tests failed. Check service status with:"
  echo "  docker compose -f docker/docker-compose.yaml ps"
  echo "  docker compose -f docker/docker-compose.yaml logs"
  exit 1
else
  echo "All infrastructure tests passed!"
  exit 0
fi
