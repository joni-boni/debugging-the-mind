-- Sicherstellen, dass die partial_surveys Tabelle existiert und korrekt konfiguriert ist
-- Dieses Skript kann sicher mehrfach ausgeführt werden

-- Tabelle erstellen falls sie nicht existiert
CREATE TABLE IF NOT EXISTS partial_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    current_step TEXT NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}',
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indizes erstellen falls sie nicht existieren
CREATE INDEX IF NOT EXISTS idx_partial_surveys_session_id ON partial_surveys(session_id);
CREATE INDEX IF NOT EXISTS idx_partial_surveys_expires_at ON partial_surveys(expires_at);
CREATE INDEX IF NOT EXISTS idx_partial_surveys_created_at ON partial_surveys(created_at);

-- Row Level Security aktivieren
ALTER TABLE partial_surveys ENABLE ROW LEVEL SECURITY;

-- Alte Policies löschen und neue erstellen (für den Fall dass sie bereits existieren)
DROP POLICY IF EXISTS "Users can manage their own partial surveys" ON partial_surveys;
DROP POLICY IF EXISTS "Allow all operations on partial_surveys" ON partial_surveys;

-- Neue Policy: Erlaube alle Operationen (da session-basiert, keine Benutzer-Authentifizierung erforderlich)
CREATE POLICY "Allow all operations on partial_surveys" ON partial_surveys
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Funktion für automatische Bereinigung erstellen/aktualisieren
CREATE OR REPLACE FUNCTION cleanup_expired_partial_surveys()
RETURNS void AS $$
BEGIN
    DELETE FROM partial_surveys 
    WHERE expires_at < NOW();
    
    -- Log der Anzahl gelöschter Einträge
    RAISE NOTICE 'Expired partial surveys cleaned up at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Funktion für updated_at Trigger erstellen/aktualisieren
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger erstellen falls er nicht existiert
DROP TRIGGER IF EXISTS update_partial_surveys_updated_at ON partial_surveys;
CREATE TRIGGER update_partial_surveys_updated_at 
    BEFORE UPDATE ON partial_surveys 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Test um sicherzustellen, dass die Tabelle funktioniert
DO $$
DECLARE
    test_session_id TEXT := 'test_' || extract(epoch from now())::text;
    test_record RECORD;
BEGIN
    -- Test-Eintrag einfügen
    INSERT INTO partial_surveys (session_id, current_step, answers, email)
    VALUES (test_session_id, 'age', '{"test": true}', 'test@example.com');
    
    -- Test-Eintrag lesen
    SELECT * INTO test_record FROM partial_surveys WHERE session_id = test_session_id;
    
    IF test_record.session_id IS NOT NULL THEN
        RAISE NOTICE 'partial_surveys table is working correctly!';
    ELSE
        RAISE EXCEPTION 'partial_surveys table test failed!';
    END IF;
    
    -- Test-Eintrag wieder löschen
    DELETE FROM partial_surveys WHERE session_id = test_session_id;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Test-Eintrag aufräumen falls Fehler auftritt
        DELETE FROM partial_surveys WHERE session_id = test_session_id;
        RAISE;
END $$;

-- Erfolg melden
SELECT 'partial_surveys table setup completed successfully!' as status;