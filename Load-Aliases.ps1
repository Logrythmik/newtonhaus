#to run: '. .\Load-Aliases.ps1' without quotes
#i.e. dot-sourcing http://ss64.com/ps/source.html

Set-Alias pm2 Run-PM2
Function Run-PM2 { node "$PSScriptRoot\node_modules\pm2\bin\pm2" $args }

Set-Alias marantz Run-Marantz
Function Run-Marantz { node "$PSScriptRoot\systems\marantz\test.js" $args }

Set-Alias insteon Run-Insteon
Function Run-Insteon { node "$PSScriptRoot\systems\insteon\test.js" $args }


$env:ISYJSDEBUG = 'true'