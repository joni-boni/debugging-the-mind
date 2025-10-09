# Datenbank Migration - 13-Schritt-Umfrage

## Problem
Die alte Datenbankstruktur enthielt nur wenige Felder (age, demographics, pets, motivation) und passte nicht zur neuen 13-Schritt-Umfrage mit allen aktuellen Feldern.

## Lösung
Die Datenbank wurde aktualisiert, um alle 13 Umfrage-Schritte zu unterstützen.

## Neue Felder in der Datenbank

### Demografische Daten
- `age` - Altersgruppe
- `gender` - Geschlecht  
- `demographics` - Berufsstatus
- `relationship` - Beziehungsstatus

### Wohlbefinden & Verbesserung
- `wellbeing` - Wohlbefinden-Slider (1-10)
- `improvements` - Array: Verbesserungsbereiche

### Unterstützungserfahrung
- `previous_support` - Array: Bisherige Unterstützungsquellen

### KI-Erfahrung
- `ai_experience` - KI-Erfahrungslevel
- `ai_motivation` - Array: KI-Nutzungsmotivationen

### Support-Präferenzen
- `support` - Array: Gewünschte Unterstützungssituationen
- `app_boundaries` - Array: App-Grenzen/No-Gos

### Newsletter & Interview
- `newsletter` - Boolean: Newsletter-Wunsch
- `interview` - Boolean: Interview-Bereitschaft

## Migration durchführen

### 1. Supabase SQL Editor öffnen
1. Gehe zu deinem Supabase Dashboard
2. Navigiere zu "SQL Editor"

### 2. Migration ausführen
Führe das Script `database/migrate_to_new_schema.sql` aus:

```sql
-- Das komplette Migrationsskript ausführen
-- (siehe migrate_to_new_schema.sql)
```

### 3. Admin E-Mail anpassen
In den RLS Policies die Admin E-Mail anpassen:
```sql
-- Ersetze 'admin@mindguard.ai' mit deiner echten Admin E-Mail
AND auth.users.email = 'deine-admin@email.com'
```

## Verifizierung

### 1. Tabellenstruktur prüfen
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'survey_responses';
```

### 2. Test-Umfrage durchführen
1. Führe eine komplette Umfrage durch
2. Prüfe im Admin Dashboard, ob alle Daten ankommen
3. Kontrolliere in der Datenbank: `SELECT * FROM survey_responses LIMIT 1;`

## Erwartete Verbesserungen

### Vollständige Datenspeicherung
- ✅ Alle 13 Umfrage-Schritte werden gespeichert
- ✅ Newsletter und Interview-Präferenzen erfasst
- ✅ Arrays für Multiple-Choice-Antworten

### Admin Dashboard
- ✅ Neue Statistiken: Wohlbefinden-Durchschnitt
- ✅ Verbesserungsbereiche-Analyse
- ✅ KI-Motivations-Auswertung
- ✅ Support-Präferenzen-Übersicht

### Performance
- ✅ Optimierte Indizes für häufige Abfragen
- ✅ Row Level Security für Datenschutz

## Rollback (falls nötig)
Falls Probleme auftreten, ist ein Backup in `survey_responses_backup` gespeichert.

```sql
-- Rollback zur alten Struktur (VORSICHTIG!)
DROP TABLE survey_responses;
ALTER TABLE survey_responses_backup RENAME TO survey_responses;
```