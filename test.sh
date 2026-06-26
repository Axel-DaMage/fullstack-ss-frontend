#!/bin/bash
set -e
echo "=== Ejecutando tests: frontend ==="
npm test -- --run 2>&1 | tail -40
echo ""
if [ $? -eq 0 ]; then
  echo "=== TODOS LOS TESTS PASARON ==="
else
  echo "=== HUBO FALLOS EN LOS TESTS ==="
  exit 1
fi
