-- Life Admin Manager Database Schema
-- Run this in your Supabase SQL Editor

-- Life obligations table for Life Admin Manager
CREATE TABLE IF NOT EXISTS life_obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'other' CHECK (category IN ('education', 'finance', 'work', 'personal', 'health', 'other')),
    type VARCHAR(20) DEFAULT 'one_time' CHECK (type IN ('one_time', 'recurring')),
    frequency VARCHAR(20) CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    consequence TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue')),
    risk_level VARCHAR(10) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    last_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_life_obligations_user_id ON life_obligations(user_id);
CREATE INDEX IF NOT EXISTS idx_life_obligations_due_date ON life_obligations(due_date);
CREATE INDEX IF NOT EXISTS idx_life_obligations_status ON life_obligations(status);
CREATE INDEX IF NOT EXISTS idx_life_obligations_type ON life_obligations(type);

-- Enable Row Level Security (RLS)
ALTER TABLE life_obligations ENABLE ROW LEVEL SECURITY;

-- RLS Policy (users can only access their own data)
CREATE POLICY "Users can manage own life obligations" ON life_obligations FOR ALL USING (user_id = auth.uid());