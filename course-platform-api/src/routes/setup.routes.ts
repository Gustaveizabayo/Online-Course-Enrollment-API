import { Router } from 'express';
import { db, initializeTables } from '../config/database';
import bcrypt from 'bcryptjs';

const router = Router();

// Initialize database
router.post('/init-db', async (req, res) => {
  try {
    await initializeTables();
    res.json({ success: true, message: 'Database tables initialized' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create admin user
router.post('/create-admin', async (req, res) => {
  try {
    const { email = 'admin@example.com', password = 'admin123', name = 'Platform Admin' } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role) 
       VALUES ($1, $2, $3, 'ADMIN') 
       ON CONFLICT (email) DO UPDATE 
       SET password_hash = EXCLUDED.password_hash, role = 'ADMIN'
       RETURNING id, name, email, role`,
      [name, email, hashedPassword]
    );
    
    res.json({
      success: true,
      message: 'Admin user created/updated',
      user: result.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check database status
router.get('/status', async (req, res) => {
  try {
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const users = await db.query('SELECT COUNT(*) as count FROM users');
    const courses = await db.query('SELECT COUNT(*) as count FROM courses');
    
    res.json({
      success: true,
      database: 'Neon PostgreSQL',
      tables: tables.rows.map(t => t.table_name),
      counts: {
        users: parseInt(users.rows[0].count),
        courses: parseInt(courses.rows[0].count)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
