# Stop any existing PostgreSQL container
docker stop course-platform-db 2>$null
docker rm course-platform-db 2>$null

# Start PostgreSQL
Write-Host "Starting PostgreSQL with Docker..." -ForegroundColor Yellow
docker run -d `
  --name course-platform-db `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=course_platform `
  -p 5432:5432 `
  postgres:15-alpine

# Wait for PostgreSQL to start
Write-Host "Waiting for PostgreSQL to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test connection
Write-Host "Testing database connection..." -ForegroundColor Yellow
docker exec course-platform-db psql -U postgres -c "SELECT version();" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL is running!" -ForegroundColor Green
    
    # Update .env file
    @"
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/course_platform"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
"@ | Out-File -FilePath .env -Encoding UTF8
    
    Write-Host "✅ .env file updated" -ForegroundColor Green
    
    # Run migrations
    Write-Host "Running database migrations..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
    
    # Seed database
    Write-Host "Seeding database..." -ForegroundColor Yellow
    npx ts-node src/database/seeds.ts
    
    Write-Host "🎉 Setup complete!" -ForegroundColor Green
    Write-Host "Run: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to start PostgreSQL" -ForegroundColor Red
}