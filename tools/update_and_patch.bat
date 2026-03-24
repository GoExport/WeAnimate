@echo off
setlocal

cd /d "%~dp0\.."

set "UPSTREAM_BRANCH=upstream/master"

set "SWF1=resources\static\animation\414827163ad4eb60\cc.swf"
set "SWF2=resources\static\animation\414827163ad4eb60\go_full.swf"
set "SWF3=resources\static\animation\414827163ad4eb60\player.swf"

echo ========================================
echo Syncing fork with upstream...
echo ========================================

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo ERROR: Not inside a git repository.
    exit /b 1
)

if exist ".git\MERGE_HEAD" (
    echo ERROR: A merge is already in progress.
    echo Run: git merge --abort
    exit /b 1
)

git remote get-url upstream >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git remote "upstream" does not exist.
    exit /b 1
)

echo Current branch:
git branch --show-current

echo.
echo Fetching upstream...
git fetch upstream
if errorlevel 1 (
    echo ERROR: git fetch upstream failed.
    exit /b 1
)

echo.
echo Starting merge from %UPSTREAM_BRANCH% without committing...
git merge --no-commit --no-ff %UPSTREAM_BRANCH%
if errorlevel 1 (
    echo.
    echo Merge reported conflicts. Attempting automatic SWF resolution...
) else (
    echo.
    echo Merge completed without conflicts.
)

echo.
echo Taking upstream versions for SWFs...
git checkout --theirs -- "%SWF1%" "%SWF2%" "%SWF3%" 2>nul
git add -- "%SWF1%" "%SWF2%" "%SWF3%"

echo.
echo Checking for remaining conflicts...
git diff --name-only --diff-filter=U > "%TEMP%\remaining_conflicts.txt"

for /f %%A in ("%TEMP%\remaining_conflicts.txt") do set SIZE=%%~zA
if not "%SIZE%"=="0" (
    echo ERROR: There are still unresolved conflicts:
    type "%TEMP%\remaining_conflicts.txt"
    echo.
    echo The SWFs were handled automatically, but the remaining files need manual resolution.
    echo After resolving them, run:
    echo   python mass_patch.py
    exit /b 1
)

echo.
echo ========================================
echo Running SWF patcher...
echo ========================================
python tools\mass_patch.py
if errorlevel 1 (
    echo ERROR: mass_patch.py failed.
    exit /b 1
)

echo.
echo ========================================
echo Done.
echo Upstream merge is prepared but NOT committed.
echo Patched SWFs are in your working tree for testing.
echo.
echo Next useful commands:
echo   git status
echo   git diff --stat
echo.
echo When satisfied later:
echo   git add "%SWF1%" "%SWF2%"
echo   git commit
echo ========================================

pause
endlocal