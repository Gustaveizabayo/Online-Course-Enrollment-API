@echo off
echo Fixing TypeScript errors...

echo Step 1: Regenerating Prisma client...
npx prisma generate

echo Step 2: Updating database...
npx prisma db push

echo Step 3: Installing Jest types...
npm install --save-dev @types/jest

echo Step 4: Compiling TypeScript...
npx tsc --noEmit

echo Step 5: Running tests...
npx jest src/tests/auth.register.test.ts --verbose

echo.
echo If tests pass, start server with:
echo npm run dev
