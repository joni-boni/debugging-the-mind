# Survey Session Management Dokumentation

## Übersicht

Die Survey-App implementiert ein robustes Session-Management-System, das es Benutzern ermöglicht, ihre Umfrage zu unterbrechen und später fortzusetzen. Diese Funktionalität ist besonders wichtig für längere Umfragen mit 13 Schritten.

## Architektur

### 1. Session-Identifikation
- **Session-ID**: Eindeutige Kennung pro Browser-Session (`session_${timestamp}_${random}`)
- **Speicherort**: `sessionStorage` für Persistenz während der Browser-Session
- **Generierung**: Automatisch beim ersten Laden der App

### 2. Datenbank-Schema

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

### 3. Speicherungs-Strategien

#### Primär: Supabase Database
- Zentrale Speicherung in `partial_surveys` Tabelle
- Automatisches Upsert bei jedem Schritt
- Row Level Security für Datenschutz

#### Fallback: Local Storage
- Wird verwendet wenn Supabase nicht verfügbar ist
- Automatische Synchronisierung bei Wiederverbindung
- Schlüssel: `partial_survey_${session_id}`

## Implementierung

### 1. Session-Speicherung

```javascript
// Automatische Speicherung bei jedem Schritt
const nextStep = async () => {
  // ... Schritt-Navigation
  
  if (currentStep !== 'landing' && currentStep !== 'success') {
    try {
      await savePartialSurvey(nextStepName, answers, email);
    } catch (error) {
      console.warn('Zwischenspeicherung fehlgeschlagen:', error);
      // Nicht blockierend - Benutzer kann weitermachen
    }
  }
};
```

### 2. Session-Wiederherstellung

```javascript
// Beim App-Start prüfen
useEffect(() => {
  const checkForPartialSurvey = async () => {
    const saved = await loadPartialSurvey();
    if (saved && saved.current_step !== 'landing') {
      setShowResumeDialog(true);
    }
  };
  checkForPartialSurvey();
}, []);
```

### 3. Benutzer-Dialog

Die App zeigt einen Dialog, wenn eine gespeicherte Session gefunden wird:
- **Fortsetzen**: Lädt gespeicherte Daten und setzt an der richtigen Stelle fort
- **Neu starten**: Löscht gespeicherte Daten und beginnt von vorne

## API-Funktionen

### Session-Management
- `generateSessionId()`: Erstellt neue Session-ID
- `getSessionId()`: Holt aktuelle Session-ID
- `savePartialSurvey(step, answers, email)`: Speichert aktuellen Zustand
- `loadPartialSurvey()`: Lädt gespeicherten Zustand
- `clearPartialSurvey()`: Löscht gespeicherte Session

### Datenbank-Operationen
- **INSERT/UPDATE**: Upsert-Pattern für robuste Speicherung
- **SELECT**: Laden basierend auf session_id
- **DELETE**: Cleanup nach Abschluss oder Neustart

## Datenschutz & Sicherheit

### Row Level Security (RLS)
- Aktiviert auf `partial_surveys` Tabelle
- Policy erlaubt alle Operationen (session-basiert, keine Benutzer-Auth)
- Automatische Bereinigung nach 7 Tagen

### Daten-Minimierung
- Nur notwendige Daten werden gespeichert
- Keine sensiblen persönlichen Daten in Zwischenspeicherung
- E-Mail nur optional und verschlüsselt übertragen

## Überwachung & Debugging

### Logging
```javascript
console.log('💾 Speichere Session für Schritt:', currentStep);
console.log('✅ Session erfolgreich gespeichert');
console.warn('⚠️ Zwischenspeicherung fehlgeschlagen:', error);
```

### Status-Anzeige
- Supabase-Verbindungsstatus in der UI
- Entwickler-Konsole für detaillierte Logs
- Fallback-Mechanismen transparent für Benutzer

## Wartung

### Automatische Bereinigung
```sql
-- Cron-Job oder manuell ausführbar
SELECT cleanup_expired_partial_surveys();
```

### Monitoring
- Überwachen der Tabellengröße
- Erfolgsrate der Session-Speicherung
- Fallback-Nutzung (Local Storage vs Database)

## Fehlerbehandlung

### Robustheit
1. **Netzwerk-Fehler**: Automatischer Fallback auf Local Storage
2. **Datenbank-Fehler**: Graceful Degradation, Benutzer kann fortfahren
3. **Korrupte Daten**: Validation und Safe Defaults
4. **Session-Konflikte**: Neueste Daten gewinnen (Last-Write-Wins)

### Recovery
- Local Storage als Backup-Mechanismus
- Manuelle Wiederherstellung über Admin-Interface möglich
- Export/Import-Funktionen für Datenrettung

## Performance

### Optimierungen
- Debounced Speicherung vermeidet excessive Database Calls
- Indizes auf häufig abgefragte Spalten
- JSONB für flexible Datenstruktur bei guter Performance

### Skalierung
- Session-Tabelle wächst linear mit Benutzern
- Automatische Bereinigung verhindert unbegrenztes Wachstum
- Horizontal skalierbar durch Supabase-Architektur

## Setup & Deployment

### Erforderliche Schritte
1. `ensure_partial_surveys_table.sql` ausführen
2. RLS-Policies konfigurieren
3. Cron-Job für Bereinigung einrichten
4. Monitoring aufsetzen

### Umgebungsvariablen
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Testing

### Automatisierte Tests
- `test_partial_surveys.sql` für Datenbank-Funktionalität
- Unit Tests für Session-Management-Funktionen
- Integration Tests für vollständigen Flow

### Manuelle Tests
1. Umfrage starten und unterbrechen
2. Browser neuladen
3. Dialog sollte erscheinen
4. "Fortsetzen" wählen
5. An korrekter Stelle fortsetzen