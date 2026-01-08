import dotenv from 'dotenv';

dotenv.config();

// Simple config without Zod for now
export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000'),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

// Validation helper
export function validateConfig() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
  }
  
  return config;
}
