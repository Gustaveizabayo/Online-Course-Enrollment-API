import { Router } from 'express';
import { db } from '../config/database';

const router = Router();

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as time');
    res.json({ 
      success: true, 
      message: 'Database connected',
      time: result.rows[0].time 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      hint: 'Check your NEON_DATABASE_URL in .env file'
    });
  }
});

// Test table creation
router.get('/test-tables', async (req, res) => {
  try {
    // Try to create a simple table
    await db.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100)
      )
    `);
    
    await db.query('INSERT INTO test_table (name) VALUES ($1)', ['Test']);
    const result = await db.query('SELECT * FROM test_table');
    
    res.json({ 
      success: true, 
      tables: result.rows,
      message: 'Database is working' 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
