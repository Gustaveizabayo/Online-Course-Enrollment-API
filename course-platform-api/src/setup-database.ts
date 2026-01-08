import { db } from './config/database';

async function setupDatabase() {
  try {
    console.log('í³Š Setting up database tables...');

    // Drop tables if they exist (for development)
    await db.query(`
      DROP TABLE IF EXISTS enrollments CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS reviews CASCADE;
      DROP TABLE IF EXISTS lessons CASCADE;
      DROP TABLE IF EXISTS course_progress CASCADE;
      DROP TABLE IF EXISTS user_activities CASCADE;
      DROP TABLE IF EXISTS courses CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create enrollments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        course_id INTEGER REFERENCES courses(id),
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        UNIQUE(user_id, course_id)
      );
    `);

    // Create other tables...
    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        course_id INTEGER REFERENCES courses(id),
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'PENDING',
        transaction_id VARCHAR(100),
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        course_id INTEGER REFERENCES courses(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id),
        title VARCHAR(200) NOT NULL,
        content TEXT,
        video_url TEXT,
        duration_minutes INTEGER,
        order_index INTEGER,
        is_preview BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS course_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        lesson_id INTEGER REFERENCES lessons(id),
        course_id INTEGER REFERENCES courses(id),
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lesson_id)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        activity_type VARCHAR(50),
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('âœ… Database tables created successfully!');

    // Create default admin user
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['Platform Admin', 'admin@example.com', hashedPassword, 'ADMIN']
    );

    console.log('í±‘ Default admin user created: admin@example.com / admin123');

  } catch (error) {
    console.error('âŒ Database setup error:', error);
    throw error;
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('âœ¨ Setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('í²¥ Setup failed:', error);
      process.exit(1);
    });
}

export default setupDatabase;
