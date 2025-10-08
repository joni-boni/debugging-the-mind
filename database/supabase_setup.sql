-- SQL-Befehle für Supabase Datenbank
-- Führen Sie diese Befehle in Ihrem Supabase SQL Editor aus

-- 1. Warteliste Tabelle erstellen
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  survey_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Survey Antworten Tabelle erstellen
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  survey_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Row Level Security (RLS) aktivieren
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- 4. Policies für öffentlichen Zugriff auf waitlist (zum Testen)
CREATE POLICY "Jeder kann zur Warteliste hinzufügen" ON waitlist
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Jeder kann Warteliste lesen" ON waitlist
  FOR SELECT TO anon, authenticated
  USING (true);

-- 5. Policies für survey_responses (nur eigene Daten)
CREATE POLICY "Benutzer können eigene Survey-Daten einfügen" ON survey_responses
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Benutzer können eigene Survey-Daten lesen" ON survey_responses
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 6. Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at DESC);

-- 7. Optional: Function um Wartelisten-Statistiken zu erhalten
CREATE OR REPLACE FUNCTION get_waitlist_stats()
RETURNS TABLE(
  total_count bigint,
  today_count bigint,
  this_week_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as this_week_count
  FROM waitlist;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;