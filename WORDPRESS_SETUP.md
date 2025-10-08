# WordPress Backend Setup für React App

## 🚀 Schnellstart mit Docker (Empfohlen)

### 1. WordPress mit Docker starten
```bash
# Im Projekt-Verzeichnis
docker-compose up -d

# Warten bis alle Container laufen (ca. 2-3 Minuten)
docker-compose logs -f wordpress
```

### 2. WordPress einrichten
1. Öffnen Sie: http://localhost:8080
2. Folgen Sie der WordPress-Installation
3. Erstellen Sie einen Admin-Account

### 3. CORS-Plugin installieren
1. Kopieren Sie `wordpress-plugin/react-cors-support.php` 
2. In WordPress: Dashboard → Plugins → Add New → Upload Plugin
3. Plugin aktivieren

### 4. Test-Inhalte erstellen
```bash
# Beispiel-Posts erstellen
wp post create --post_title="Willkommen bei MindGuard AI" --post_content="<p>Dies ist ein Test-Post...</p>" --post_status=publish
```

### 5. React App starten
```bash
npm start
```

## 🔧 Alternative Setups

### Option A: XAMPP/MAMP
1. WordPress in `/htdocs/wordpress/` installieren
2. `.env` auf `http://localhost/wordpress/wp-json/wp/v2` setzen
3. CORS-Plugin installieren

### Option B: Local by Flywheel
1. Neue WordPress-Site erstellen: `debugging-the-mind.local`
2. `.env` entsprechend anpassen
3. CORS-Plugin installieren

### Option C: Production Server
1. WordPress auf Server installieren
2. SSL-Zertifikat einrichten
3. `.env` auf HTTPS-URL setzen
4. CORS für React-App-Domain konfigurieren

## 🛠 WordPress REST API testen

### API-Endpunkte testen:
```bash
# Posts abrufen
curl http://localhost:8080/wp-json/wp/v2/posts

# Site-Config abrufen  
curl http://localhost:8080/wp-json/mindguard/v1/config

# Kategorien abrufen
curl http://localhost:8080/wp-json/wp/v2/categories
```

## 🔐 Authentifizierung (Optional)

Für private Inhalte JWT-Plugin installieren:
```bash
# WordPress JWT Plugin
wp plugin install jwt-authentication-for-wp-rest-api --activate
```

## 📝 WordPress-Inhalte optimieren

### Empfohlene Plugins:
- **Yoast SEO**: Für bessere SEO-Daten in der API
- **Advanced Custom Fields**: Für benutzerdefinierte Felder
- **WP REST API Controller**: Für erweiterte API-Kontrolle

### Wichtige WordPress-Einstellungen:
1. **Permalinks**: Auf "Post name" setzen
2. **REST API**: Standardmäßig aktiviert (WordPress 4.7+)
3. **Media**: Große Bilder für Featured Images verwenden

## 🚨 Troubleshooting

### CORS-Fehler beheben:
1. Plugin aktiviert? ✅
2. React-App URL in Plugin eingetragen? ✅
3. Browser-Cache geleert? ✅

### API nicht erreichbar:
1. WordPress läuft? `http://localhost:8080`
2. REST API aktiv? `http://localhost:8080/wp-json/wp/v2`
3. Firewall-Einstellungen prüfen

### Performance optimieren:
1. Caching aktivieren
2. Bilder komprimieren
3. CDN verwenden (Production)

## 📊 Monitoring

WordPress-Logs checken:
```bash
# Docker Logs
docker-compose logs wordpress

# PHP Error Logs im Dashboard
WordPress → Tools → Site Health
```