-- Setup missing tables for new features
-- Copy and paste this into your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tasks table for AI Task & To-Do Manager
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    ai_generated BOOLEAN DEFAULT FALSE,
    source_message_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders table for Smart Reminders System
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    repeat_type VARCHAR(20) DEFAULT 'none' CHECK (repeat_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
    repeat_interval INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    ai_generated BOOLEAN DEFAULT FALSE,
    source_message_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document summaries table for File & Document Summarizer
CREATE TABLE IF NOT EXISTS document_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_url TEXT,
    summary TEXT NOT NULL,
    key_points TEXT[],
    word_count INTEGER,
    page_count INTEGER,
    file_type VARCHAR(50),
    processing_status VARCHAR(20) DEFAULT 'completed' CHECK (processing_status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_time ON reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON reminders(is_active);
CREATE INDEX IF NOT EXISTS idx_document_summaries_user_id ON document_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_document_summaries_file_id ON document_summaries(file_id);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can manage own tasks" ON tasks FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own reminders" ON reminders FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own document summaries" ON document_summaries FOR ALL USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON reminders TO authenticated;
GRANT ALL ON document_summaries TO authenticated;

-- Test the tables
SELECT 'Tasks table created successfully' as message WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks');
SELECT 'Reminders table created successfully' as message WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reminders');
SELECT 'Document summaries table created successfully' as message WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_summaries');