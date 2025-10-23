Param(
  [string]$Output = "crm-release.tar.gz"
)

Write-Host "[Empacotar] Criando pacote $Output com exclusões comuns..."

# Garante execução no diretório raiz do projeto
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
Set-Location $rootDir

# Usa tar (bsdtar no Windows) com excludes para reduzir tamanho
$exclude = @(
  "--exclude=.git",
  "--exclude=.github",
  "--exclude=backend/node_modules",
  "--exclude=frontend/node_modules",
  "--exclude=frontend/tests",
  "--exclude=frontend/tests/screenshots",
  "--exclude=**/*.log"
)

if (Test-Path $Output) { Remove-Item -Force $Output }

$cmd = @("tar", "-czf", $Output) + $exclude + @(".")
Write-Host "Comando:" ($cmd -join ' ')

$proc = Start-Process -FilePath $cmd[0] -ArgumentList ($cmd[1..($cmd.Length-1)]) -NoNewWindow -PassThru -Wait
if ($proc.ExitCode -ne 0) {
  Write-Error "Falha ao criar $Output (exit: $($proc.ExitCode))"
  exit 1
}

Write-Host "[Empacotar] OK: $Output criado com sucesso."