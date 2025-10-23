Param(
  [string]$Hostname,
  [int]$Port = 22,
  [string]$Username = "root",
  [string]$Password,
  [string]$ReleaseFile = "crm-release.tar.gz",
  [string]$RemoteDir = "/opt/crm",
  [string]$BackendUrl,
  [string]$JwtSecret
)

if (-not $Hostname -or -not $Password) {
  Write-Error "Informe -Host e -Password"
  exit 1
}

Import-Module Posh-SSH

# 1) Testa SSH
$sec = ConvertTo-SecureString $Password -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential($Username, $sec)
$sess = $null
try {
  $sess = New-SSHSession -ComputerName $Hostname -Port $Port -Credential $cred -AcceptKey:$true -ConnectionTimeout 15 -ErrorAction Stop
  Write-Host ("[SSH] Conectado em {0}:{1} como {2}" -f $Hostname, $Port, $Username)
} catch {
  Write-Error "Falha SSH: $($_.Exception.Message)"
  exit 1
}

try {
  # 2) Envia release via SCP
  if (-not (Test-Path $ReleaseFile)) { Write-Error "Release '$ReleaseFile' não encontrado"; exit 1 }
  $remoteRelease = "/root/$ReleaseFile"
  $exists = Invoke-SSHCommand -SessionId $sess.SessionId -Command "test -f $remoteRelease && echo EXISTS || echo MISSING" | Select-Object -ExpandProperty Output
  if ($exists -match "EXISTS") {
    Write-Host "[SCP] Release já existe em $remoteRelease, pulando upload"
  } else {
    Write-Host "[SCP] Enviando $ReleaseFile para /root/"
    Set-SCPItem -ComputerName $Hostname -Port $Port -Credential $cred -AcceptKey -Path $ReleaseFile -Destination "/root/" -ErrorAction Stop
  }

  # 3) Prepara diretório remoto
  Write-Host "[Remote] Preparando $RemoteDir"
  Invoke-SSHCommand -SessionId $sess.SessionId -Command "mkdir -p $RemoteDir" | Out-Null
  Invoke-SSHCommand -SessionId $sess.SessionId -Command "tar -xzf $remoteRelease -C $RemoteDir" | Out-Null

  # 4) Instala Docker e abre portas
  Write-Host "[Remote] Instalando Docker/Compose e abrindo portas"
  Invoke-SSHCommand -SessionId $sess.SessionId -Command "bash $RemoteDir/server/install_docker_and_open_ports.sh" | Out-Null

  # 5/6) Sobe containers com VITE_BACKEND_SERVER e JWT_SECRET (se fornecidos)
  Write-Host "[Remote] Subindo containers"
  $envPrefix = ""
  if ($BackendUrl) { $envPrefix += "export VITE_BACKEND_SERVER='$BackendUrl'; " }
  if ($JwtSecret)  { $envPrefix += "export JWT_SECRET='$JwtSecret'; " }
  $composeCmd = $envPrefix + "cd $RemoteDir && docker compose -f docker-compose.server.yml up -d --build"
  Invoke-SSHCommand -SessionId $sess.SessionId -Command $composeCmd | ForEach-Object { $_.Output | Write-Host }

  # 7) Valida saúde externamente instruções
  Write-Host "[OK] Deploy remoto concluído. Teste: http://$Hostname:3000/ e http://$Hostname:8888/health"
} finally {
  if ($sess) { Remove-SSHSession -SessionId $sess.SessionId | Out-Null }
}