-- Migration: Freitextfelder für "sonstige Anmerkungen" hinzufügen
-- Diese Felder speichern die Freitexteingaben der Nutzer bei "Sonstiges"-Optionen

ALTER TABLE survey_responses 
ADD COLUMN ai_motivation_other TEXT DEFAULT NULL,
ADD COLUMN support_other TEXT DEFAULT NULL,
ADD COLUMN app_boundaries_other TEXT DEFAULT NULL;

-- Kommentare für bessere Dokumentation
COMMENT ON COLUMN survey_responses.ai_motivation_other IS 'Freitexteingabe für sonstige KI-Motivation';
COMMENT ON COLUMN survey_responses.support_other IS 'Freitexteingabe für sonstige Support-Präferenzen';
COMMENT ON COLUMN survey_responses.app_boundaries_other IS 'Freitexteingabe für sonstige App-Grenzen';

-- Index für bessere Performance bei Textsuchen (optional)
CREATE INDEX IF NOT EXISTS idx_survey_responses_ai_motivation_other ON survey_responses USING gin(to_tsvector('german', ai_motivation_other));
CREATE INDEX IF NOT EXISTS idx_survey_responses_support_other ON survey_responses USING gin(to_tsvector('german', support_other));
CREATE INDEX IF NOT EXISTS idx_survey_responses_app_boundaries_other ON survey_responses USING gin(to_tsvector('german', app_boundaries_other));