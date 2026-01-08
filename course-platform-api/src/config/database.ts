import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Get the Neon database URL from environment variables
const neonDatabaseUrl = process.env.NEON_DATABASE_URL;

if (!neonDatabaseUrl) {
  console.error('❌ NEON_DATABASE_URL is not set in .env file');
  process.exit(1);
}

console.log('��� Using Neon PostgreSQL connection');

// For Neon, we need special SSL configuration
const poolConfig = {
  connectionString: neonDatabaseUrl,
  ssl: {
    rejectUnauthorized: false,
    require: true
  },
  // Neon-specific optimizations
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Create PostgreSQL connection pool
export const db = new Pool(poolConfig);

// Test the database connection
export async function testConnection() {
  let client;
  try {
    client = await db.connect();
    const result = await client.query('SELECT NOW() as time');
    console.log('✅ Neon PostgreSQL connected at:', result.rows[0].time);

    // Check connection details
    const connInfo = await client.query('SELECT current_database() as db, current_user as user');
    console.log(`��� Database: ${connInfo.rows[0].db}, User: ${connInfo.rows[0].user}`);

    return true;
  } catch (error: any) {
    console.error('❌ Neon connection failed:', error.message);

    // Provide specific troubleshooting
    if (error.code === '28000') {
      console.log('\n��� Authentication failed. Check your password in NEON_DATABASE_URL');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n��� Host not found. Check your Neon endpoint URL');
    } else if (error.message.includes('SSL')) {
      console.log('\n��� SSL issue. Try removing &channel_binding=require from the URL');
    }

    return false;
  } finally {
    if (client) client.release();
  }
}

// Initialize database tables
export async function initializeTables() {
  try {
    console.log('\n��� Checking/creating database tables...');

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'STUDENT',
        profile_image TEXT,
        bio TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table ready');

    // Create courses table
    await db.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        instructor_id INTEGER REFERENCES users(id),
        price DECIMAL(10,2) DEFAULT 0,
        category VARCHAR(100),
        level VARCHAR(50),
        rating DECIMAL(3,2) DEFAULT 0,
        total_enrollments INTEGER DEFAULT 0,
        duration_hours INTEGER,
        thumbnail_url TEXT,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Courses table ready');

    // Create other tables as needed...
    console.log('✨ Database tables initialized!');

    // Check if we have any users
    const userCount = await db.query('SELECT COUNT(*) FROM users');
    console.log(`��� Total users: ${userCount.rows[0].count}`);

    return true;
  } catch (error: any) {
    console.error('❌ Table initialization failed:', error.message);
    return false;
  }
}

// Helper function for queries
export const query = (text: string, params?: any[]) => db.query(text, params);

// Test the connection on startup
testConnection().then(async (connected) => {
  if (connected) {
    // Initialize tables if connected - DISABLED to avoid conflict with Prisma
    // await initializeTables();
    console.log(' Manual table initialization skipped (using Prisma)');
  }
});
