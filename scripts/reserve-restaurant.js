const { chromium } = require('playwright');

async function reserveRestaurant() {
  // Browser starten
  const browser = await chromium.launch({ 
    headless: false, // Sichtbar für debugging
    slowMo: 1000 // Langsamer für bessere Sichtbarkeit
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🍽️ Starte Restaurantreservierung...');
    
    // Zur Goldmarie Website navigieren
    await page.goto('https://www.goldmariemainz.de/#reservierung');
    await page.waitForLoadState('networkidle');
    
    console.log('📍 Website geladen, suche Reservierungsformular...');
    
    // Warten bis die Seite vollständig geladen ist
    await page.waitForTimeout(3000);
    
    // Screenshot machen für debugging
    await page.screenshot({ path: 'goldmarie-before.png', fullPage: true });
    
    // Verschiedene mögliche Selektoren für das Reservierungsformular testen
    const possibleSelectors = [
      'input[name="name"]',
      'input[placeholder*="Name"]',
      '#name',
      '.name-input',
      'input[type="text"]'
    ];
    
    let nameInput = null;
    for (const selector of possibleSelectors) {
      try {
        nameInput = await page.locator(selector).first();
        if (await nameInput.isVisible()) {
          console.log(`✅ Name-Feld gefunden: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (nameInput) {
      // Formular ausfüllen
      console.log('📝 Fülle Reservierungsformular aus...');
      
      // Name eingeben
      await nameInput.fill('Jonas Greis');
      await page.waitForTimeout(500);
      
      // E-Mail suchen und eingeben
      const emailSelectors = [
        'input[name="email"]',
        'input[type="email"]',
        'input[placeholder*="mail"]',
        'input[placeholder*="Email"]'
      ];
      
      for (const selector of emailSelectors) {
        try {
          const emailInput = page.locator(selector).first();
          if (await emailInput.isVisible()) {
            await emailInput.fill('jonas-greis@outlook.de');
            console.log('✉️ E-Mail eingegeben');
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Personenanzahl eingeben
      const personSelectors = [
        'input[name="persons"]',
        'input[name="guests"]',
        'select[name="persons"]',
        '.person-count'
      ];
      
      for (const selector of personSelectors) {
        try {
          const personInput = page.locator(selector).first();
          if (await personInput.isVisible()) {
            await personInput.fill('2');
            console.log('👥 Personenanzahl: 2');
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Zeit eingeben (12:45)
      const timeSelectors = [
        'input[name="time"]',
        'input[type="time"]',
        'select[name="time"]',
        '.time-select'
      ];
      
      for (const selector of timeSelectors) {
        try {
          const timeInput = page.locator(selector).first();
          if (await timeInput.isVisible()) {
            await timeInput.fill('12:45');
            console.log('🕐 Zeit: 12:45');
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Datum (heute)
      const today = new Date().toISOString().split('T')[0];
      const dateSelectors = [
        'input[name="date"]',
        'input[type="date"]',
        '.date-picker'
      ];
      
      for (const selector of dateSelectors) {
        try {
          const dateInput = page.locator(selector).first();
          if (await dateInput.isVisible()) {
            await dateInput.fill(today);
            console.log(`📅 Datum: ${today}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Screenshot nach dem Ausfüllen
      await page.screenshot({ path: 'goldmarie-filled.png', fullPage: true });
      
      // Submit Button finden und klicken
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        '.submit-btn',
        '.reserve-btn',
        'button:has-text("Reservieren")',
        'button:has-text("Senden")',
        'button:has-text("Bestätigen")'
      ];
      
      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          const submitBtn = page.locator(selector).first();
          if (await submitBtn.isVisible()) {
            console.log('🚀 Sende Reservierung...');
            await submitBtn.click();
            submitted = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (submitted) {
        // Warten auf Bestätigung
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'goldmarie-submitted.png', fullPage: true });
        
        // Prüfen ob Bestätigung erschienen ist
        const confirmationTexts = [
          'erfolgreich',
          'bestätigt',
          'erhalten',
          'danke',
          'vielen dank'
        ];
        
        for (const text of confirmationTexts) {
          try {
            const confirmation = page.locator(`text=${text}`).first();
            if (await confirmation.isVisible()) {
              console.log('✅ Reservierung erfolgreich bestätigt!');
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        console.log('🎉 Reservierungsprozess abgeschlossen!');
        console.log('📧 Überprüfe deine E-Mails für die Bestätigung.');
        
      } else {
        console.log('⚠️ Submit-Button nicht gefunden. Formular wurde ausgefüllt, aber nicht abgesendet.');
        console.log('👀 Überprüfe die Screenshots und sende manuell ab.');
      }
      
    } else {
      console.log('❌ Reservierungsformular nicht gefunden.');
      console.log('🔍 Überprüfe die Website manually oder das Formular hat sich geändert.');
      
      // Alle verfügbaren Inputs anzeigen für debugging
      const allInputs = await page.locator('input').count();
      console.log(`📋 Gefundene Input-Felder: ${allInputs}`);
      
      if (allInputs > 0) {
        for (let i = 0; i < Math.min(allInputs, 10); i++) {
          const input = page.locator('input').nth(i);
          const type = await input.getAttribute('type');
          const name = await input.getAttribute('name');
          const placeholder = await input.getAttribute('placeholder');
          console.log(`Input ${i}: type="${type}", name="${name}", placeholder="${placeholder}"`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Fehler bei der Reservierung:', error);
    await page.screenshot({ path: 'goldmarie-error.png', fullPage: true });
  } finally {
    // Browser offen lassen für manuelle Überprüfung
    console.log('🔍 Browser bleibt offen für manuelle Überprüfung...');
    console.log('⏳ Drücke Ctrl+C um zu beenden.');
    
    // 5 Minuten warten bevor automatisch geschlossen wird
    await page.waitForTimeout(300000);
    await browser.close();
  }
}

// Script ausführen
reserveRestaurant().catch(console.error);