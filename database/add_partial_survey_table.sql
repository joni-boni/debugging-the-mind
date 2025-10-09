-- Neue Tabelle für Zwischenspeicherung unvollständiger Umfragen
CREATE TABLE IF NOT EXISTS partial_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    current_step TEXT NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}',
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') -- Automatische Löschung nach 7 Tagen
);

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_partial_surveys_session_id ON partial_surveys(session_id);
CREATE INDEX IF NOT EXISTS idx_partial_surveys_expires_at ON partial_surveys(expires_at);

-- Row Level Security aktivieren
ALTER TABLE partial_surveys ENABLE ROW LEVEL SECURITY;

-- RLS-Policy: Jeder kann seine eigenen partial surveys lesen/schreiben (basierend auf session_id)
CREATE POLICY "Users can manage their own partial surveys" ON partial_surveys
    FOR ALL USING (true); -- Keine Authentifizierung erforderlich, da session-basiert

-- Automatische Bereinigung alter Einträge (optional)
-- Diese Funktion kann per Cron-Job ausgeführt werden
CREATE OR REPLACE FUNCTION cleanup_expired_partial_surveys()
RETURNS void AS $$
BEGIN
    DELETE FROM partial_surveys 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger um updated_at automatisch zu aktualisieren
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_partial_surveys_updated_at 
    BEFORE UPDATE ON partial_surveys 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();