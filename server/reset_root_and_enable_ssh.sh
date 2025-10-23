#!/usr/bin/env bash
set -euo pipefail

# Uso: sudo bash reset_root_and_enable_ssh.sh [nova_senha_root]
# Se não informar, usa a senha padrão solicitada.

if [[ ${EUID} -ne 0 ]]; then
  echo "[ERRO] Execute como root (ex.: sudo -s)." >&2
  exit 1
fi

NEW_PASS="${1:-v4eRIw0G!uYR}"

SSH_CFG="/etc/ssh/sshd_config"
BACKUP="/etc/ssh/sshd_config.bak.$(date +%F-%H%M%S)"

echo "[INFO] Fazendo backup de ${SSH_CFG} -> ${BACKUP}"
cp -a "${SSH_CFG}" "${BACKUP}"

ensure_cfg() {
  local key="$1"; local value="$2"; local file="$3"
  if grep -qE "^\s*${key}\b" "${file}"; then
    sed -i -E "s/^\s*${key}.*/${key} ${value}/" "${file}"
  else
    echo "${key} ${value}" >> "${file}"
  fi
}

echo "[INFO] Habilitando login por senha e acesso root no SSH"
ensure_cfg "PasswordAuthentication" "yes" "${SSH_CFG}"
ensure_cfg "PermitRootLogin" "yes" "${SSH_CFG}"
ensure_cfg "PubkeyAuthentication" "yes" "${SSH_CFG}"
ensure_cfg "UsePAM" "yes" "${SSH_CFG}"
ensure_cfg "PermitEmptyPasswords" "no" "${SSH_CFG}"

echo "[INFO] Validando configuração do sshd"
if command -v sshd >/dev/null 2>&1; then
  sshd -t
fi

echo "[INFO] Atualizando senha do root"
echo "root:${NEW_PASS}" | chpasswd
usermod -U root || true
chsh -s /bin/bash root || true

echo "[INFO] Ajustando firewall para porta 22 (se aplicável)"
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp || true
  ufw reload || true
fi
if command -v firewall-cmd >/dev/null 2>&1; then
  firewall-cmd --permanent --add-service=ssh || firewall-cmd --permanent --add-port=22/tcp || true
  firewall-cmd --reload || true
fi
if command -v iptables >/dev/null 2>&1; then
  iptables -C INPUT -p tcp --dport 22 -j ACCEPT >/dev/null 2>&1 || iptables -I INPUT -p tcp --dport 22 -j ACCEPT
fi

echo "[INFO] Reiniciando serviço SSH"
restart_ssh() {
  if command -v systemctl >/dev/null 2>&1; then
    systemctl restart sshd 2>/dev/null || systemctl restart ssh 2>/dev/null || true
  elif command -v service >/dev/null 2>&1; then
    service sshd restart 2>/dev/null || service ssh restart 2>/dev/null || /etc/init.d/ssh restart 2>/dev/null || true
  else
    /etc/init.d/sshd restart 2>/dev/null || /etc/init.d/ssh restart 2>/dev/null || true
  fi
}
restart_ssh

echo "[SUCESSO] Senha do root atualizada e SSH habilitado para senha."
echo "[DICA] Teste: ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no root@SEU_IP"
set -euo pipefail

# Uso: sudo bash reset_root_and_enable_ssh.sh <nova_senha_root>

if [[ ${EUID} -ne 0 ]]; then
  echo "[ERRO] Execute como root (ex.: sudo -s)." >&2
  exit 1
fi

NEW_PASS="${1:-}"
if [[ -z "${NEW_PASS}" ]]; then
  echo "[ERRO] Informe a nova senha do root:"
  echo "       sudo bash reset_root_and_enable_ssh.sh 'NovaSenhaForte#2025'"
  exit 1
fi

SSH_CFG="/etc/ssh/sshd_config"
BACKUP="/etc/ssh/sshd_config.bak.$(date +%F-%H%M%S)"

echo "[INFO] Fazendo backup de ${SSH_CFG} -> ${BACKUP}"
cp -a "${SSH_CFG}" "${BACKUP}"

ensure_cfg() {
  local key="$1"; local value="$2"; local file="$3"
  if grep -qE "^\s*${key}\b" "${file}"; then
    sed -i -E "s/^\s*${key}.*/${key} ${value}/" "${file}"
  else
    echo "${key} ${value}" >> "${file}"
  fi
}

echo "[INFO] Habilitando login por senha e acesso root no SSH"
ensure_cfg "PasswordAuthentication" "yes" "${SSH_CFG}"
ensure_cfg "PermitRootLogin" "yes" "${SSH_CFG}"
ensure_cfg "PubkeyAuthentication" "yes" "${SSH_CFG}"
ensure_cfg "UsePAM" "yes" "${SSH_CFG}"
ensure_cfg "PermitEmptyPasswords" "no" "${SSH_CFG}"

echo "[INFO] Validando configuração do sshd"
if command -v sshd >/dev/null 2>&1; then
  sshd -t
fi

echo "[INFO] Atualizando senha do root"
echo "root:${NEW_PASS}" | chpasswd
usermod -U root || true
chsh -s /bin/bash root || true

echo "[INFO] Ajustando firewall para porta 22 (se aplicável)"
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp || true
  ufw reload || true
fi
if command -v firewall-cmd >/dev/null 2>&1; then
  firewall-cmd --permanent --add-service=ssh || firewall-cmd --permanent --add-port=22/tcp || true
  firewall-cmd --reload || true
fi
if command -v iptables >/dev/null 2>&1; then
  iptables -C INPUT -p tcp --dport 22 -j ACCEPT >/dev/null 2>&1 || iptables -I INPUT -p tcp --dport 22 -j ACCEPT
fi

echo "[INFO] Reiniciando serviço SSH"
restart_ssh() {
  if command -v systemctl >/dev/null 2>&1; then
    systemctl restart sshd 2>/dev/null || systemctl restart ssh 2>/dev/null || true
  elif command -v service >/dev/null 2>&1; then
    service sshd restart 2>/dev/null || service ssh restart 2>/dev/null || /etc/init.d/ssh restart 2>/dev/null || true
  else
    /etc/init.d/sshd restart 2>/dev/null || /etc/init.d/ssh restart 2>/dev/null || true
  fi
}
restart_ssh

echo "[SUCESSO] Senha do root atualizada e SSH habilitado para senha."
echo "[DICA] Teste: ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no root@SEU_IP"