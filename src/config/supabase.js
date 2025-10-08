import { createClient } from '@supabase/supabase-js'

// Supabase URL und Anon Key aus den Umgebungsvariablen laden
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validierung der Umgebungsvariablen
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Fehlende Supabase-Konfiguration. Bitte stellen Sie sicher, dass REACT_APP_SUPABASE_URL und REACT_APP_SUPABASE_ANON_KEY in der .env Datei gesetzt sind.'
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
 * Speichert Survey-Antworten in der Datenbank
 */
export const saveSurveyData = async (surveyData) => {
  const user = await getCurrentUser()
  
  const { data, error } = await supabase
    .from('survey_responses')
    .insert([
      {
        user_id: user?.id,
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

// Auth State Change Listener
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}

export default supabase