-- Migration: Fix Quiz Tables - Add Default Values
-- Run this in Supabase SQL Editor
-- Your tables exist but are missing default values for id and timestamp columns

-- ============================================
-- FIX QUIZZES TABLE - Add default values
-- ============================================
ALTER TABLE public.quizzes 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ALTER COLUMN status SET DEFAULT 'generating',
  ALTER COLUMN total_questions SET DEFAULT 0,
  ALTER COLUMN ai_model SET DEFAULT 'gemini-2.5-flash',
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- ============================================
-- FIX QUESTIONS TABLE - Add default values
-- ============================================
ALTER TABLE public.questions 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ALTER COLUMN order_index SET DEFAULT 0,
  ALTER COLUMN created_at SET DEFAULT now();

-- ============================================
-- FIX USER_ANSWERS TABLE - Add default values
-- ============================================
ALTER TABLE public.user_answers 
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ALTER COLUMN is_correct SET DEFAULT false,
  ALTER COLUMN answered_at SET DEFAULT now();

-- ============================================
-- Create indexes for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_quizzes_document_id ON public.quizzes(document_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON public.quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON public.questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_quiz_id ON public.user_answers(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON public.user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON public.user_answers(user_id);

-- ============================================
-- Enable Row Level Security
-- ============================================
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Drop existing policies if they exist (to avoid conflicts)
-- ============================================
DROP POLICY IF EXISTS "Allow all quiz operations" ON public.quizzes;
DROP POLICY IF EXISTS "Allow all question operations" ON public.questions;
DROP POLICY IF EXISTS "Allow all user_answers operations" ON public.user_answers;

-- ============================================
-- Create permissive policies (allow all operations for now)
-- ============================================
CREATE POLICY "Allow all quiz operations" ON public.quizzes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all question operations" ON public.questions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all user_answers operations" ON public.user_answers
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Grant permissions to all roles
-- ============================================
GRANT ALL ON public.quizzes TO anon, authenticated, service_role;
GRANT ALL ON public.questions TO anon, authenticated, service_role;
GRANT ALL ON public.user_answers TO anon, authenticated, service_role;
