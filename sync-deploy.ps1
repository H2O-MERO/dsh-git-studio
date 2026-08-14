# 一键把本插件源码同步到 DSH 部署目录（node_modules/dsh-git-graph）
# 用法：.\sync-deploy.ps1 [-Dst <部署目录>]
#   不带参数时依次使用 $env:DSH_GIT_GRAPH_DST 与下方默认占位路径（请按你的环境修改）。
param(
    [string]$Dst = $env:DSH_GIT_GRAPH_DST
)
$src = $PSScriptRoot
if (-not $Dst) { $Dst = 'C:\Users\<your-user>\.dsh\profiles\web\node_modules\dsh-git-graph' }

if (-not (Test-Path $Dst)) { Write-Host "未找到部署目录：$Dst" -ForegroundColor Red; exit 1 }

Copy-Item "$src\index.js"   "$Dst\index.js"   -Force
Copy-Item "$src\client.js"  "$Dst\client.js"  -Force
Copy-Item "$src\web\index.html" "$Dst\web\index.html" -Force

Write-Host "已同步到 $Dst" -ForegroundColor Green
Write-Host "提示：index.js / client.js 改动需重启 dsh web；web/index.html 刷新即生效。"
