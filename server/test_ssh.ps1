Param(
    [string]$Username = 'root',
    [string]$Password = 'v4eRIw0G!uYR',
    [string]$Hostname = '178.156.192.189',
    [int]$Port = 22
)

Import-Module Posh-SSH

$sec = ConvertTo-SecureString $Password -AsPlainText -Force
$cred = New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList $Username, $sec

try {
    $sess = New-SSHSession -ComputerName $Hostname -Port $Port -Credential $cred -AcceptKey:$true -ConnectionTimeout 15 -ErrorAction Stop
    Write-Host 'LOGIN_OK'
    Remove-SSHSession -SessionId $sess.SessionId | Out-Null
} catch {
    Write-Host 'LOGIN_FAIL'
    Write-Host $_.Exception.Message
}