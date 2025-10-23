#!/usr/bin/env bash
set -euo pipefail

echo "[1/4] Detectando SO..."
. /etc/os-release || true
OS=${ID:-unknown}
echo "SO detectado: ${OS}"

echo "[2/4] Instalando Docker Engine (se necessário)..."
if command -v docker >/dev/null 2>&1; then
  echo "Docker já instalado: $(docker --version)"
else
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
fi

echo "[3/4] Instalando Docker Compose v2 (plugin) somente se ausente..."
if ! docker compose version >/dev/null 2>&1; then
  case "$OS" in
    ubuntu|debian)
      if ! dpkg -s docker-compose-plugin >/dev/null 2>&1; then
        apt-get update && apt-get install -y docker-compose-plugin
      else
        echo "docker-compose-plugin já instalado"
      fi
      ;;
    centos|rhel|fedora)
      if ! rpm -q docker-compose-plugin >/dev/null 2>&1; then
        yum install -y docker-compose-plugin || dnf install -y docker-compose-plugin || true
      else
        echo "docker-compose-plugin já instalado"
      fi
      ;;
    *)
      echo "SO ${OS} não suportado automaticamente para Compose plugin. Pule se já disponível."
      ;;
  esac
fi

echo "[4/4] Abrindo portas 3000 e 8888 no firewall (se UFW ou firewalld presentes)..."
if command -v ufw >/dev/null 2>&1; then
  ufw allow 3000/tcp || true
  ufw allow 8888/tcp || true
  ufw status || true
else
  if command -v firewall-cmd >/dev/null 2>&1; then
    firewall-cmd --permanent --add-port=3000/tcp || true
    firewall-cmd --permanent --add-port=8888/tcp || true
    firewall-cmd --reload || true
  else
    echo "Firewall não detectado (ufw/firewalld). Certifique-se de liberar portas no provedor."
  fi
fi

echo "Instalação concluída. Docker: $(docker --version). Compose: $(docker compose version || echo 'não encontrado')."