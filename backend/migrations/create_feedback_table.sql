-- Migration: Create feedback table for content quality feedback mechanism
-- Story 4.4: Content Quality Feedback Mechanism

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('summary', 'quiz')),
    user_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_content_id ON feedback(content_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_content_type ON feedback(content_type);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can insert their own feedback
CREATE POLICY "Users can insert own feedback" ON feedback
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policy: Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON feedback
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policy: Allow service role to manage all feedback (for admin/analytics)
CREATE POLICY "Service role can manage all feedback" ON feedback
    FOR ALL
    USING (auth.role() = 'service_role');

-- Grant access to authenticated users
GRANT SELECT, INSERT ON feedback TO authenticated;
GRANT SELECT, INSERT ON feedback TO anon;
