# Online Course Enrollment API - Setup Script
# Run this in PowerShell

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Online Course Enrollment API" -ForegroundColor Cyan
Write-Host "Setup & Verification Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "[OK] Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Node.js not found. Please install Node.js v16+" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Host "[OK] npm installed: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] npm not found" -ForegroundColor Red
    exit 1
}

# Check .env file
Write-Host ""
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "[OK] .env file exists" -ForegroundColor Green
    
    # Check if DATABASE_URL is set
    $envContent = Get-Content .env -Raw
    if ($envContent -match 'DATABASE_URL="postgresql://') {
        Write-Host "[OK] DATABASE_URL is configured" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] DATABASE_URL might not be properly configured" -ForegroundColor Yellow
    }
} else {
    Write-Host "[INFO] Creating .env file from template..." -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "[OK] .env file created" -ForegroundColor Green
        Write-Host ""
        Write-Host "ACTION REQUIRED:" -ForegroundColor Red
        Write-Host "Please edit .env file and update:" -ForegroundColor Yellow
        Write-Host "  - DATABASE_URL with your PostgreSQL credentials" -ForegroundColor White
        Write-Host "  - JWT_SECRET with a secure random string" -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter after updating .env file"
    }
}

# Check PostgreSQL
Write-Host ""
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgVersion = psql --version 2>$null
if ($pgVersion) {
    Write-Host "[OK] PostgreSQL installed: $pgVersion" -ForegroundColor Green
} else {
    Write-Host "[WARNING] PostgreSQL not found in PATH" -ForegroundColor Yellow
    Write-Host "If PostgreSQL is installed, you may need to add it to PATH" -ForegroundColor Yellow
    Write-Host "Or install from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Steps" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Ask user if they want to continue
$continue = Read-Host "Do you want to continue with database setup? (y/n)"
if ($continue -ne 'y') {
    Write-Host "Setup cancelled. Please configure your environment and run this script again." -ForegroundColor Yellow
    exit 0
}

# Generate Prisma Client
Write-Host ""
Write-Host "Step 1: Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to generate Prisma Client" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL in .env file" -ForegroundColor Yellow
    exit 1
}

# Run migrations
Write-Host ""
Write-Host "Step 2: Running database migrations..." -ForegroundColor Yellow
Write-Host "When prompted for migration name, enter: init" -ForegroundColor Cyan
npm run prisma:migrate
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Migrations completed" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Migration failed" -ForegroundColor Red
    Write-Host "Please ensure:" -ForegroundColor Yellow
    Write-Host "  1. PostgreSQL is running" -ForegroundColor White
    Write-Host "  2. Database credentials in .env are correct" -ForegroundColor White
    Write-Host "  3. Database 'course_enrollment' exists" -ForegroundColor White
    exit 1
}

# Ask about seeding
Write-Host ""
$seed = Read-Host "Do you want to seed the database with sample data? (y/n)"
if ($seed -eq 'y') {
    Write-Host "Seeding database..." -ForegroundColor Yellow
    npm run prisma:seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Database seeded successfully" -ForegroundColor Green
        Write-Host ""
        Write-Host "Test accounts created:" -ForegroundColor Cyan
        Write-Host "  Admin: admin@example.com / password123" -ForegroundColor White
        Write-Host "  Instructor: instructor1@example.com / password123" -ForegroundColor White
        Write-Host "  Student: student1@example.com / password123" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the server:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then visit:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000/api-docs" -ForegroundColor Cyan
Write-Host ""
