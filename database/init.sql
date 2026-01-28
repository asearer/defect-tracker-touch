-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums (Matching Prisma Schema)
-- UserRole
CREATE TYPE "UserRole" AS ENUM ('Operator', 'Quality', 'Supervisor', 'Engineer', 'Admin');

-- DefectStatus
CREATE TYPE "DefectStatus" AS ENUM ('Open', 'Under Review', 'Contained', 'Closed');

-- RootCauseCategory
CREATE TYPE "RootCauseCategory" AS ENUM ('Man', 'Machine', 'Method', 'Material', 'Measurement', 'Environment');

-- CapaStatus
CREATE TYPE "CapaStatus" AS ENUM ('Open', 'In Progress', 'Verified', 'Closed');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role "UserRole" NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Machines Table
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    integration_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Defect Types Table (Standardized)
CREATE TABLE defect_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL, -- e.g., 'Molding', 'Dimensional'
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Defect Logs Table
CREATE TABLE defect_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    machine_id UUID REFERENCES machines(id),
    station VARCHAR(100),
    operator_id UUID REFERENCES users(id),
    defect_type_id UUID REFERENCES defect_types(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    image_url TEXT,
    status "DefectStatus" DEFAULT 'Open',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
    changed_by UUID REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    old_values JSONB,
    new_values JSONB
);

-- CAPA Table (Corrective and Preventive Actions)
CREATE TABLE capa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    defect_log_id UUID REFERENCES defect_logs(id),
    root_cause_category "RootCauseCategory",
    why_1 TEXT,
    why_2 TEXT,
    why_3 TEXT,
    why_4 TEXT,
    why_5 TEXT,
    corrective_action TEXT,
    assignee_id UUID REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    status "CapaStatus" DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data
INSERT INTO defect_types (category, code, description) VALUES
('Molding', 'SS', 'Short Shot'),
('Molding', 'FL', 'Flash'),
('Molding', 'SK', 'Sink'),
('Molding', 'WP', 'Warp'),
('Molding', 'GB', 'Gas Burn'),
('Molding', 'WL', 'Weld / Flowlines'),
('Molding', 'HG', 'High Gate'),
('Molding', 'BB', 'Bubbles'),
('Dimensional', 'BH', 'Blocked Hole / Slot'),
('Dimensional', 'DM', 'Dimension'),
('Material', 'CI', 'Color Incorrect'),
('Material', 'CN', 'Contamination'),
('Material', 'EX', 'Expired'),
('Cosmetic', 'CS', 'Cosmetic'),
('Cosmetic', 'BR', 'Burrs'),
('Secondary', 'PD', 'Pad Printing Defect'),
('Secondary', 'LP', 'Labeling / Packaging Incorrect'),
('Handling', 'DP', 'Damaged Part');

INSERT INTO machines (name, location, integration_id) VALUES
('Press-01', 'Zone A', 'IMM-001'),
('Press-02', 'Zone A', 'IMM-002'),
('Press-03', 'Zone B', 'IMM-003'),
('Press-04', 'Zone B', 'IMM-004');
