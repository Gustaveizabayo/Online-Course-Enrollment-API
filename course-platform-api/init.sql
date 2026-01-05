-- init.sql - Initialize PostgreSQL database for Course Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create readonly user (optional, for read-only operations)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'readonly') THEN
        CREATE USER readonly WITH PASSWORD 'readonly123';
    END IF;
END
$$;

-- Grant privileges
GRANT CONNECT ON DATABASE course_platform TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly;

-- Create indexes for better performance (optional)
-- These will be created by Prisma, but you can add custom ones here