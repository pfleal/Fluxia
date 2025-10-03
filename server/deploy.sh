#!/usr/bin/env bash
set -euo pipefail

BASE_DIR=${BASE_DIR:-/opt/crm}
COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.server.yml}

echo "[1/4] Indo para ${BASE_DIR}"
cd "${BASE_DIR}"

echo "[2/4] Subindo containers (build + detach)..."
docker compose -f "${COMPOSE_FILE}" up -d --build

echo "[3/4] Status dos containers:"
docker compose -f "${COMPOSE_FILE}" ps

echo "[4/4] Checando saúde do backend via localhost..."
for i in {1..10}; do
  if curl -fsS http://localhost:8888/health >/dev/null 2>&1; then
    echo "Backend OK"
    break
  fi
  echo "Aguardando backend subir... (${i}/10)"
  sleep 3
done

echo "Pronto. Teste externo esperado: http://<IP_PUBLICO>:3000/ e http://<IP_PUBLICO>:8888/health"