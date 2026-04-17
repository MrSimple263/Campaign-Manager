-- Set timezone to UTC
SET timezone = 'UTC';
ALTER DATABASE campaign_manager SET timezone TO 'UTC';

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database if not exists (handled by Docker env var)
-- This script runs after DB is created

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE campaign_manager TO postgres;

-- Create test database for running tests
SELECT 'CREATE DATABASE campaign_manager_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'campaign_manager_test')\gexec

-- Connect to test database and enable UUID extension
\c campaign_manager_test
SET timezone = 'UTC';
ALTER DATABASE campaign_manager_test SET timezone TO 'UTC';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges on test database
GRANT ALL PRIVILEGES ON DATABASE campaign_manager_test TO postgres;
