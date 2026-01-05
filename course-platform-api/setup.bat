@echo off
echo Creating project structure...
mkdir prisma 2>nul
mkdir src 2>nul
mkdir src\config 2>nul
mkdir src\database 2>nul
mkdir src\modules 2>nul
mkdir src\modules\auth 2>nul
mkdir src\modules\courses 2>nul
mkdir src\modules\enrollments 2>nul
mkdir src\modules\payments 2>nul
mkdir src\middlewares 2>nul
mkdir src\utils 2>nul

echo Installing dependencies...
call npm install

echo Generating Prisma client...
call npx prisma generate

echo Starting PostgreSQL with Docker...
docker run -d --name course-platform-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=course_platform -p 5432:5432 postgres:15-alpine

echo Waiting for PostgreSQL to start...
timeout /t 5 /nobreak >nul

echo Running migrations...
call npx prisma migrate dev --name init

echo Starting server...
call npm run dev