-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    serviceType TEXT,
    projectDetails TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create estimates table
CREATE TABLE IF NOT EXISTS estimates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectType TEXT NOT NULL,
    roomSize TEXT,
    budget TEXT,
    timeline TEXT,
    contactInfo TEXT NOT NULL,
    estimatedCost REAL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    customerEmail TEXT NOT NULL,
    projectId TEXT,
    message TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(createdAt);
CREATE INDEX IF NOT EXISTS idx_estimates_created_at ON estimates(createdAt);
CREATE INDEX IF NOT EXISTS idx_messages_email ON messages(customerEmail);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(createdAt);

-- Create triggers to update updatedAt timestamp
CREATE TRIGGER IF NOT EXISTS update_leads_timestamp 
    AFTER UPDATE ON leads
    BEGIN
        UPDATE leads SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_estimates_timestamp 
    AFTER UPDATE ON estimates
    BEGIN
        UPDATE estimates SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_messages_timestamp 
    AFTER UPDATE ON messages
    BEGIN
        UPDATE messages SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;