param(
    [Parameter(Position=0)]
    [ValidateSet("setup", "dev", "build", "test", "supabase", "deploy", "clean", "help")]
    [string]$Command = "help"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

function Write-Header($text) {
    Write-Host ""
    Write-Host "  $text" -ForegroundColor Cyan
    Write-Host "  $('-' * $text.Length)" -ForegroundColor DarkCyan
}

function Write-Step($text) {
    Write-Host "  > $text" -ForegroundColor Green
}

function Write-Warn($text) {
    Write-Host "  ! $text" -ForegroundColor Yellow
}

# ─── setup: 의존성 설치 + 환경 확인 ───
function Invoke-Setup {
    Write-Header "프로젝트 설정"

    # Node.js 확인
    $nodeVer = node -v 2>$null
    if (-not $nodeVer) {
        Write-Warn "Node.js가 설치되어 있지 않습니다."
        return
    }
    Write-Step "Node.js $nodeVer"

    # npm install
    Write-Step "의존성 설치 중..."
    Set-Location $ProjectRoot
    npm install
    Write-Step "의존성 설치 완료"

    # .env.local 확인
    $envFile = Join-Path $ProjectRoot ".env.local"
    if (-not (Test-Path $envFile)) {
        Write-Step ".env.local 파일 생성 중..."
        @"
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
"@ | Set-Content $envFile -Encoding UTF8
    }

    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "your_supabase_url") {
        Write-Warn ".env.local에 Supabase 키가 아직 설정되지 않았습니다."
        Write-Warn "  dev.ps1 supabase 명령으로 설정하세요."
    } else {
        Write-Step "Supabase 키 설정 확인됨"
    }

    Write-Host ""
    Write-Host "  설정 완료! 'dev.ps1 dev'로 개발 서버를 시작하세요." -ForegroundColor Green
}

# ─── dev: 개발 서버 실행 ───
function Invoke-Dev {
    Write-Header "개발 서버 시작"
    Write-Step "http://localhost:3000 에서 확인하세요"
    Write-Step "Ctrl+C로 종료"
    Write-Host ""
    Set-Location $ProjectRoot
    npm run dev
}

# ─── build: 프로덕션 빌드 ───
function Invoke-Build {
    Write-Header "프로덕션 빌드"
    Set-Location $ProjectRoot
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Step "빌드 성공!"
    } else {
        Write-Warn "빌드 실패. 오류를 확인하세요."
    }
}

# ─── test: 테스트 실행 ───
function Invoke-Test {
    Write-Header "테스트 실행"
    Set-Location $ProjectRoot
    npx vitest run
}

# ─── supabase: Supabase 키 설정 ───
function Invoke-Supabase {
    Write-Header "Supabase 설정"

    $envFile = Join-Path $ProjectRoot ".env.local"

    Write-Host ""
    Write-Host "  Supabase 대시보드에서 키를 복사하세요:" -ForegroundColor White
    Write-Host "  Settings > API > Project URL / anon key" -ForegroundColor DarkGray
    Write-Host ""

    $url = Read-Host "  Supabase URL"
    $key = Read-Host "  Supabase Anon Key"

    if ([string]::IsNullOrWhiteSpace($url) -or [string]::IsNullOrWhiteSpace($key)) {
        Write-Warn "URL과 Key 모두 입력해야 합니다."
        return
    }

    @"
NEXT_PUBLIC_SUPABASE_URL=$url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$key
"@ | Set-Content $envFile -Encoding UTF8

    Write-Step ".env.local 업데이트 완료"

    # SQL 마이그레이션 안내
    Write-Host ""
    Write-Host "  다음 단계:" -ForegroundColor White
    Write-Host "  1. Supabase 대시보드 > SQL Editor 에서" -ForegroundColor DarkGray
    Write-Host "     supabase/migrations/001_init.sql 내용을 실행하세요." -ForegroundColor DarkGray
    Write-Host "  2. 'dev.ps1 dev'로 개발 서버를 시작하세요." -ForegroundColor DarkGray

    # SQL 파일 클립보드 복사 제안
    $sqlFile = Join-Path $ProjectRoot "supabase\migrations\001_init.sql"
    if (Test-Path $sqlFile) {
        Write-Host ""
        $copy = Read-Host "  SQL을 클립보드에 복사할까요? (y/n)"
        if ($copy -eq "y") {
            Get-Content $sqlFile -Raw | Set-Clipboard
            Write-Step "클립보드에 복사되었습니다. SQL Editor에 붙여넣기하세요."
        }
    }
}

# ─── deploy: Vercel 배포 ───
function Invoke-Deploy {
    Write-Header "Vercel 배포"

    $vercel = Get-Command vercel -ErrorAction SilentlyContinue
    if (-not $vercel) {
        Write-Warn "Vercel CLI가 설치되어 있지 않습니다."
        Write-Step "설치: npm i -g vercel"
        return
    }

    Set-Location $ProjectRoot
    Write-Step "Vercel 배포 시작..."
    vercel --prod
}

# ─── clean: 빌드 캐시 정리 ───
function Invoke-Clean {
    Write-Header "캐시 정리"
    $dirs = @(".next", "node_modules/.cache")
    foreach ($dir in $dirs) {
        $path = Join-Path $ProjectRoot $dir
        if (Test-Path $path) {
            Remove-Item $path -Recurse -Force
            Write-Step "$dir 삭제됨"
        }
    }
    Write-Step "정리 완료"
}

# ─── help: 사용법 ───
function Invoke-Help {
    Write-Host ""
    Write-Host "  도산안창호함 무사귀환 응원 사이트 - 개발 도구" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  사용법: .\dev.ps1 <command>" -ForegroundColor White
    Write-Host ""
    Write-Host "  명령어:" -ForegroundColor White
    Write-Host "    setup     의존성 설치 및 환경 확인" -ForegroundColor Gray
    Write-Host "    dev       개발 서버 실행 (localhost:3000)" -ForegroundColor Gray
    Write-Host "    build     프로덕션 빌드" -ForegroundColor Gray
    Write-Host "    test      테스트 실행" -ForegroundColor Gray
    Write-Host "    supabase  Supabase 키 설정 + SQL 복사" -ForegroundColor Gray
    Write-Host "    deploy    Vercel 배포" -ForegroundColor Gray
    Write-Host "    clean     빌드 캐시 정리" -ForegroundColor Gray
    Write-Host "    help      이 도움말 표시" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  빠른 시작:" -ForegroundColor White
    Write-Host "    1. .\dev.ps1 setup" -ForegroundColor DarkGray
    Write-Host "    2. .\dev.ps1 supabase" -ForegroundColor DarkGray
    Write-Host "    3. .\dev.ps1 dev" -ForegroundColor DarkGray
    Write-Host ""
}

# ─── 실행 ───
switch ($Command) {
    "setup"    { Invoke-Setup }
    "dev"      { Invoke-Dev }
    "build"    { Invoke-Build }
    "test"     { Invoke-Test }
    "supabase" { Invoke-Supabase }
    "deploy"   { Invoke-Deploy }
    "clean"    { Invoke-Clean }
    "help"     { Invoke-Help }
}
