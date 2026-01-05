@echo off
echo ================================
echo Online Course Enrollment API
echo Database Setup Helper
echo ================================
echo.

echo Step 1: Checking if PostgreSQL is installed...
where psql >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL is installed
) else (
    echo [!] PostgreSQL not found in PATH
    echo Please install PostgreSQL or add it to your PATH
    echo Download from: https://www.postgresql.org/download/windows/
)
echo.

echo Step 2: Checking .env file...
if exist .env (
    echo [OK] .env file exists
) else (
    echo [!] .env file not found
    echo Creating .env from template...
    copy .env.example .env
    echo.
    echo [ACTION REQUIRED] Please edit .env file and update:
    echo - DATABASE_URL with your PostgreSQL credentials
    echo - JWT_SECRET with a secure random string
)
echo.

echo Step 3: Next steps to run:
echo.
echo   1. Edit .env file with your database credentials
echo   2. Create database: psql -U postgres -c "CREATE DATABASE course_enrollment;"
echo   3. Run: npm run prisma:generate
echo   4. Run: npm run prisma:migrate
echo   5. Run: npm run prisma:seed (optional)
echo   6. Run: npm run dev
echo.
echo ================================
pause
