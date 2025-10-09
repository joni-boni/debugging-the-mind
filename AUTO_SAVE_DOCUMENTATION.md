# Zwischenspeicherung (Auto-Save) Funktionalität

## Übersicht

Die Umfrage-App speichert jetzt automatisch den Fortschritt bei jedem "Weiter"-Click, damit Benutzer ihre Daten nicht verlieren wenn sie die Umfrage unterbrechen.

## Features

### ✅ Automatische Speicherung
- **Bei jedem Schritt:** Antworten werden automatisch gespeichert wenn Benutzer auf "Weiter" klicken
- **Dual Storage:** Sowohl in Supabase-Datenbank als auch als Fallback im Browser-LocalStorage
- **Keine Unterbrechung:** Speicherung läuft im Hintergrund, blockiert nicht die Benutzer-Erfahrung

### ✅ Session Management
- **Einzigartige Session-ID:** Jede Browser-Session erhält eine eindeutige ID
- **Automatische Erkennung:** App erkennt beim Start ob eine unterbrochene Umfrage existiert
- **7-Tage-Speicher:** Zwischenspeicherungen verfallen automatisch nach 7 Tagen

### ✅ Resume Dialog
- **Smart Detection:** Dialog erscheint nur wenn eine sinnvolle gespeicherte Umfrage existiert
- **Zwei Optionen:** Benutzer können fortsetzen oder neu starten
- **Benutzerfreundlich:** Klare Optionen ohne Verwirrung

## Technische Implementation

### Datenbank-Schema
```sql
CREATE TABLE partial_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    current_step TEXT NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}',
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);
```

### Neue Funktionen in `supabase.js`
- `generateSessionId()` - Erstellt eindeutige Session-IDs
- `savePartialSurvey()` - Speichert aktuellen Umfrage-Stand
- `loadPartialSurvey()` - Lädt gespeicherte Umfrage
- `clearPartialSurvey()` - Löscht Zwischenspeicherung nach Abschluss

### App-Integration
- **nextStep() erweitert:** Automatische Speicherung bei Schritt-Wechsel
- **useEffect Hook:** Prüft beim App-Start auf gespeicherte Umfragen
- **Resume Dialog:** Modal für Benutzer-Entscheidung
- **Cleanup:** Automatische Löschung nach erfolgreichem Abschluss

## Fallback-Strategien

### Bei Supabase-Verbindungsfehlern
1. **Lokale Speicherung:** Automatischer Fallback auf Browser LocalStorage
2. **Synchronisation:** Daten werden später synchronisiert wenn Verbindung wieder da ist
3. **Keine Datenverluste:** Benutzer können immer fortfahren

### Bei Browser-Problemen
1. **Session Storage:** Session-IDs in sessionStorage gespeichert
2. **Persistenz:** LocalStorage als Backup für längere Speicherung
3. **Robustheit:** Mehrere Speicher-Schichten für maximale Zuverlässigkeit

## Benutzer-Erfahrung

### Neuer Benutzer
1. Startet Umfrage normal
2. Bei jedem "Weiter"-Click: Automatische Speicherung (unsichtbar)
3. Bei Unterbrechung: Daten bleiben erhalten

### Wiederkehrender Benutzer
1. Öffnet App
2. Sieht Resume-Dialog wenn unterbrochene Umfrage existiert
3. Kann wählen: "Fortsetzen" oder "Neu starten"
4. Nahtlose Weiterführung vom letzten Schritt

### Nach Abschluss
1. Finale Speicherung in survey_responses Tabelle
2. Automatische Löschung der Zwischenspeicherung
3. Danke-Seite ohne weitere Unterbrechungen

## Wartung & Performance

### Automatische Bereinigung
- **7-Tage Regel:** Alte Einträge verfallen automatisch
- **Cleanup-Funktion:** `cleanup_expired_partial_surveys()` kann per Cron ausgeführt werden
- **Performance:** Indizierte Abfragen für schnelle Zugriffe

### Überwachung
- **Console Logs:** Detaillierte Logs für Debugging
- **Error Handling:** Graceful Degradation bei Fehlern  
- **Fallback-Status:** Sichtbare Indikatoren für Fallback-Modi

## Migration

### Bestehende Benutzer
- **Keine Änderungen:** Bestehende Umfragen funktionieren weiterhin
- **Rückwärtskompatibel:** Neue Features sind optional
- **Nahtlose Integration:** Keine Unterbrechung für laufende Sessions

### Deployment
1. **SQL-Migration ausführen:** `database/add_partial_survey_table.sql`
2. **App deployen:** Neuer Code mit Zwischenspeicherung
3. **Testen:** Resume-Funktionalität in verschiedenen Szenarien

## Nächste Schritte

### Geplante Verbesserungen
- [ ] Admin-Dashboard: Statistiken über abgebrochene Umfragen
- [ ] Email-Erinnerungen für unvollständige Umfragen
- [ ] Erweiterte Offline-Unterstützung
- [ ] Cross-Device Synchronisation

### Monitoring
- [ ] Überwachung der Abbruch-Raten
- [ ] Performance-Metriken der Zwischenspeicherung
- [ ] Benutzer-Feedback zur Resume-Funktionalität