import { createClient } from '@supabase/supabase-js'

// Supabase URL und Anon Key aus den Umgebungsvariablen laden
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validierung der Umgebungsvariablen
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Fehlende Supabase-Konfiguration. Bitte stelle sicher, dass REACT_APP_SUPABASE_URL und REACT_APP_SUPABASE_ANON_KEY in der .env Datei gesetzt sind.'
  )
}

// Supabase Client erstellen
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Utility-Funktionen für häufige Operationen

/**
 * Prüft ob ein Benutzer eingeloggt ist
 */
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

/**
 * Holt die aktuelle Benutzersession
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Meldet einen Benutzer mit E-Mail/Passwort an
 */
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    throw error
  }
  
  return data
}

/**
 * Registriert einen neuen Benutzer
 */
export const signUpWithEmail = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  
  if (error) {
    throw error
  }
  
  return data
}

/**
 * Meldet den aktuellen Benutzer ab
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw error
  }
}

/**
 * Speichert Survey-Antworten strukturiert in der Datenbank
 */
export const saveSurveyData = async (surveyData) => {
  const user = await getCurrentUser()
  
  // Strukturierte Daten aus surveyData extrahieren - alle 13 Schritte
  const structuredData = {
    user_id: user?.id,
    email: surveyData.email,
    
    // Demografische Daten
    age: surveyData.age,
    gender: surveyData.gender,
    demographics: surveyData.demographics,
    relationship: surveyData.relationship,
    
    // Wohlbefinden & Verbesserung
    wellbeing: surveyData.wellbeing,
    improvements: surveyData.improvements || [],
    
    // Unterstützungserfahrung
    previous_support: surveyData.previous_support || [],
    
    // KI-Erfahrung
    ai_experience: surveyData.ai_experience,
    ai_motivation: surveyData.ai_motivation || [],
    
    // Support-Präferenzen
    support: surveyData.support || [],
    app_boundaries: surveyData.app_boundaries || [],
    
    // Newsletter & Interview
    newsletter: surveyData.newsletter || false,
    interview: surveyData.interview || false,
    
    // Metadata
    created_at: new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('survey_responses')
    .insert([structuredData])
  
  if (error) {
    throw error
  }
  
  return data
}

/**
 * Holt Survey-Antworten eines Benutzers
 */
export const getUserSurveyData = async () => {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Benutzer ist nicht angemeldet')
  }
  
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw error
  }
  
  return data
}

/**
 * Speichert E-Mail-Adressen für die Warteliste
 */
export const addToWaitlist = async (email, surveyData = null) => {
  const { data, error } = await supabase
    .from('waitlist')
    .insert([
      {
        email,
        survey_data: surveyData,
        created_at: new Date().toISOString()
      }
    ])
  
  if (error) {
    throw error
  }
  
  return data
}

/**
 * Zwischenspeicherung-Funktionen für unvollständige Umfragen
 */

// Session-ID generieren (einmalig pro Browser-Session)
export const generateSessionId = () => {
  const existing = sessionStorage.getItem('survey_session_id')
  if (existing) return existing
  
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  sessionStorage.setItem('survey_session_id', sessionId)
  return sessionId
}

// Aktuelle Session-ID abrufen
export const getSessionId = () => {
  return sessionStorage.getItem('survey_session_id') || generateSessionId()
}

// Zwischenspeicherung der aktuellen Umfrage-Daten
export const savePartialSurvey = async (currentStep, answers, email = null) => {
  const sessionId = getSessionId()
  
  const partialData = {
    session_id: sessionId,
    current_step: currentStep,
    answers: answers,
    email: email,
    updated_at: new Date().toISOString()
  }
  
  try {
    // Upsert: Update wenn session_id existiert, sonst Insert
    const { data, error } = await supabase
      .from('partial_surveys')
      .upsert([partialData], { 
        onConflict: 'session_id',
        ignoreDuplicates: false 
      })
    
    if (error) {
      console.warn('Fehler beim Zwischenspeichern in Supabase:', error)
      // Fallback: Lokale Speicherung
      localStorage.setItem('partial_survey_' + sessionId, JSON.stringify(partialData))
      return { success: true, fallback: true }
    }
    
    console.log('✅ Umfrage zwischengespeichert:', currentStep)
    return { success: true, data }
  } catch (error) {
    console.warn('Zwischenspeicherung fehlgeschlagen:', error)
    // Fallback: Lokale Speicherung
    localStorage.setItem('partial_survey_' + getSessionId(), JSON.stringify(partialData))
    return { success: true, fallback: true }
  }
}

// Gespeicherte Umfrage-Daten laden
export const loadPartialSurvey = async () => {
  const sessionId = getSessionId()
  
  try {
    // Erst aus Supabase versuchen
    const { data, error } = await supabase
      .from('partial_surveys')
      .select('*')
      .eq('session_id', sessionId)
      .single()
    
    if (error || !data) {
      // Fallback: Lokale Speicherung prüfen  
      const localData = localStorage.getItem('partial_survey_' + sessionId)
      if (localData) {
        const parsed = JSON.parse(localData)
        console.log('Umfrage aus lokalem Speicher geladen')
        return parsed
      }
      return null
    }
    
    console.log('Umfrage aus Supabase geladen')
    return data
  } catch (error) {
    console.warn('Fehler beim Laden der Zwischenspeicherung:', error)
    
    // Fallback: Lokale Speicherung
    const localData = localStorage.getItem('partial_survey_' + sessionId)
    if (localData) {
      return JSON.parse(localData)
    }
    
    return null
  }
}

// Zwischenspeicherung löschen (nach erfolgreichem Abschluss)
export const clearPartialSurvey = async () => {
  const sessionId = getSessionId()
  
  try {
    // Aus Supabase löschen
    await supabase
      .from('partial_surveys')
      .delete()
      .eq('session_id', sessionId)
    
    // Aus lokalem Speicher löschen
    localStorage.removeItem('partial_survey_' + sessionId)
    sessionStorage.removeItem('survey_session_id')
    
    console.log('🧹 Zwischenspeicherung gelöscht')
  } catch (error) {
    console.warn('Fehler beim Löschen der Zwischenspeicherung:', error)
  }
}

// Auth State Change Listener
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}

export default supabase