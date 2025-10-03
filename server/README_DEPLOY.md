# Deploy no Servidor (Docker/Compose)

Este guia instala Docker e Docker Compose, libera portas externas e sobe os containers do CRM.

## Pré-requisitos
- Acesso SSH ao servidor como `root` ou usuário com sudo.
- Arquivo `crm-release.tar.gz` gerado a partir do projeto.

## Passo a passo

1. Envie o pacote para o servidor:
   - `scp crm-release.tar.gz root@<IP_DO_SERVIDOR>:/root/`

2. Acesse o servidor e instale Docker/Compose e libere portas:
   - `ssh root@<IP_DO_SERVIDOR>`
   - `bash /opt/crm/server/install_docker_and_open_ports.sh` (veja o Passo 3 para preparar este script)

3. Prepare diretório e scripts no servidor:
   - `mkdir -p /opt/crm`
   - `tar -xzf /root/crm-release.tar.gz -C /opt/crm`
   - `cd /opt/crm`
   - Scripts disponíveis:
     - `server/install_docker_and_open_ports.sh`: instala Docker/Compose e abre portas 3000/8888.
     - `server/deploy.sh`: descompacta (opcional), sobe containers e valida saúde.

4. Suba os containers:
   - `bash server/deploy.sh`
   - Isso executa `docker compose -f docker-compose.server.yml up -d --build` e testa `http://localhost:8888/health`.

5. Testes externos
   - Backend: `http://<IP_DO_SERVIDOR>:8888/health` → deve retornar `{"status":"ok"}`
   - Frontend: `http://<IP_DO_SERVIDOR>:3000/`

## Notas
- `docker-compose.server.yml` usa `Dockerfile.prod` para backend e frontend.
- `VITE_BACKEND_SERVER` é injetado no build do frontend e já aponta para o IP público do servidor.
- Em produção, não exponha Mongo na porta 27017 para Internet.