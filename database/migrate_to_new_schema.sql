-- Migration Script: Von alter zu neuer Tabellenstruktur
-- Führe dieses Script in deinem Supabase SQL Editor aus

-- 1. Backup der alten Daten (falls vorhanden)
CREATE TABLE IF NOT EXISTS survey_responses_backup AS 
SELECT * FROM survey_responses;

-- 2. Lösche alte Tabelle (vorsichtig!)
DROP TABLE IF EXISTS survey_responses CASCADE;

-- 3. Erstelle neue Tabellenstruktur
CREATE TABLE survey_responses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id),
    email VARCHAR(255) NOT NULL,
    
    -- Demografische Daten
    age VARCHAR(50) DEFAULT NULL,
    gender VARCHAR(50) DEFAULT NULL,
    demographics VARCHAR(100) DEFAULT NULL,
    relationship VARCHAR(100) DEFAULT NULL,
    
    -- Wohlbefinden & Verbesserung
    wellbeing INTEGER DEFAULT NULL, -- Slider 1-10
    improvements TEXT[] DEFAULT NULL, -- Array von Verbesserungsbereichen
    
    -- Unterstützungserfahrung
    previous_support TEXT[] DEFAULT NULL, -- Array von bisherigen Unterstützungsquellen
    
    -- KI-Erfahrung
    ai_experience VARCHAR(100) DEFAULT NULL,
    ai_motivation TEXT[] DEFAULT NULL, -- Array von KI-Motivationen
    
    -- Support-Präferenzen
    support TEXT[] DEFAULT NULL, -- Array von gewünschten Unterstützungssituationen
    app_boundaries TEXT[] DEFAULT NULL, -- Array von App-Grenzen
    
    -- Newsletter & Interview
    newsletter BOOLEAN DEFAULT FALSE,
    interview BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Erstelle/Update Warteliste Tabelle
CREATE TABLE IF NOT EXISTS waitlist (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(255) NOT NULL UNIQUE,
    survey_data JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Erstelle Indizes
CREATE INDEX idx_survey_responses_email ON survey_responses(email);
CREATE INDEX idx_survey_responses_created_at ON survey_responses(created_at);
CREATE INDEX idx_survey_responses_age ON survey_responses(age);
CREATE INDEX idx_survey_responses_demographics ON survey_responses(demographics);
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);

-- 6. Aktiviere Row Level Security
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- 7. Erstelle RLS Policies
CREATE POLICY "Public can insert survey responses" ON survey_responses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own survey responses" ON survey_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can insert to waitlist" ON waitlist
    FOR INSERT WITH CHECK (true);

-- Admin Policies (ersetze admin@mindguard.ai mit deiner Admin E-Mail)
CREATE POLICY "Admin can view all survey responses" ON survey_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@mindguard.ai'
        )
    );

CREATE POLICY "Admin can view all waitlist entries" ON waitlist
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'admin@mindguard.ai'
        )
    );

-- 8. Grant Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON survey_responses TO anon, authenticated;
GRANT ALL ON waitlist TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Migration abgeschlossen!
SELECT 'Migration completed successfully!' as status;