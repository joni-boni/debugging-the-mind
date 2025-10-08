// Survey Konfiguration - alle Fragen und Optionen zentral verwaltet

export const SURVEY_CONFIG = {
  totalSteps: 7,
  
  // Step 2: Alter
  ageQuestion: {
    title: "Wie alt bist du?",
    subtitle: "Wähle deine Altersgruppe aus.",
    options: [
      { value: '16-18', label: '16-18 Jahre' },
      { value: '19-25', label: '19-25 Jahre' },
      { value: '26-35', label: '26-35 Jahre' },
      { value: '36-45', label: '36-45 Jahre' },
      { value: '46+', label: '46+ Jahre' }
    ]
  },

  // Step 3: Gender
  genderQuestion: {
    title: "Welches Geschlecht hast du?",
    subtitle: "Diese Information hilft uns bei der Analyse.",
    options: [
      { value: 'male', label: 'Männlich' },
      { value: 'female', label: 'Weiblich' },
      { value: 'diverse', label: 'Divers' }
    ]
  },

  // Step 4: Demographics
  demographicsQuestion: {
    title: "Was machst du hauptsächlich?",
    subtitle: "Wähle deine aktuelle Lebenssituation aus.",
    options: [
      { 
        value: 'student', 
        label: 'Student/in', 
        description: 'Studium an Universität oder Hochschule' 
      },
      { 
        value: 'employee', 
        label: 'Angestellt', 
        description: 'Vollzeit oder Teilzeit angestellt' 
      },
      { 
        value: 'selfemployed', 
        label: 'Selbstständig', 
        description: 'Eigenes Unternehmen oder freiberuflich' 
      },
      { 
        value: 'unemployed', 
        label: 'Arbeitslos', 
        description: 'Derzeit auf Jobsuche' 
      },
      { 
        value: 'retired', 
        label: 'Rentner/in', 
        description: 'Im Ruhestand' 
      },
      { 
        value: 'other', 
        label: 'Anderes', 
        description: 'Andere Lebenssituation' 
      }
    ]
  },

  // Step 4: Pets
  petsQuestion: {
    title: "Welche Haustiere hast du?",
    subtitle: "Du kannst mehrere auswählen oder 'Keine Haustiere' wählen.",
    options: [
      { value: 'dog', label: '🐕 Hund' },
      { value: 'cat', label: '🐱 Katze' },
      { value: 'bird', label: '🐦 Vogel' },
      { value: 'fish', label: '🐠 Fisch' },
      { value: 'rabbit', label: '🐰 Kaninchen' },
      { value: 'hamster', label: '🐹 Hamster/Meerschweinchen' },
      { value: 'reptile', label: '🦎 Reptil' },
      { value: 'other-pet', label: '🐾 Anderes Haustier' },
      { value: 'no-pets', label: '❌ Keine Haustiere' }
    ],
    exclusiveOptions: ['no-pets'], // "Keine Haustiere" schließt andere aus
    maxSelections: null // Unbegrenzt, außer bei exklusiven Optionen
  },

  // Step 6: Motivation Goals
  motivationQuestion: {
    title: "Was motiviert dich am meisten?",
    subtitle: "Wähle bis zu 3 Bereiche aus, die dich besonders antreiben.",
    options: [
      { 
        value: 'career', 
        label: '🚀 Beruflicher Erfolg', 
        description: 'Karriere und berufliche Entwicklung' 
      },
      { 
        value: 'health', 
        label: '💪 Gesundheit & Fitness', 
        description: 'Körperliche und mentale Gesundheit' 
      },
      { 
        value: 'relationships', 
        label: '❤️ Beziehungen', 
        description: 'Familie, Freunde und Partnerschaften' 
      },
      { 
        value: 'creativity', 
        label: '🎨 Kreativität', 
        description: 'Künstlerische und kreative Projekte' 
      },
      { 
        value: 'learning', 
        label: '📚 Lernen & Wachstum', 
        description: 'Persönliche Weiterentwicklung' 
      },
      { 
        value: 'travel', 
        label: '✈️ Reisen & Abenteuer', 
        description: 'Neue Orte und Erfahrungen entdecken' 
      },
      { 
        value: 'financial', 
        label: '💰 Finanzielle Sicherheit', 
        description: 'Vermögensaufbau und Absicherung' 
      },
      { 
        value: 'impact', 
        label: '🌍 Gesellschaftlicher Einfluss', 
        description: 'Anderen helfen und Unterschied machen' 
      }
    ],
    maxSelections: 3,
    minSelections: 1
  },

  // Step 7: Email Success
  emailQuestion: {
    title: "Fast geschafft! 🎉",
    subtitle: "Gib deine E-Mail-Adresse ein, um deine personalisierten Ergebnisse zu erhalten."
  },

  // Static Pages Content
  staticPages: {
    landing: {
      title: "Willkommen zum Persönlichkeitstest! 🧠",
      subtitle: "Entdecke mehr über dich selbst in nur wenigen Minuten.",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="font-semibold text-blue-800 mb-2">Was erwartet dich?</h3>
            <ul className="text-blue-700 space-y-2">
              <li>✓ 5-7 kurze Fragen über dich</li>
              <li>✓ Personalisierte Einblicke</li>
              <li>✓ Nur 3-5 Minuten deiner Zeit</li>
            </ul>
          </div>
          <p className="text-gray-600 text-center">
            Bereit herauszufinden, was dich einzigartig macht?
          </p>
        </div>
      ),
      nextButtonText: "Los geht's!"
    },

    tests: {
      title: "Deine Tests starten gleich! 🧪",
      subtitle: "Bereite dich auf spannende Einblicke vor.",
      content: (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl text-center">
          <div className="text-6xl mb-4">🔬</div>
          <p className="text-gray-600 mb-6">
            Basierend auf deinen bisherigen Antworten werden wir nun einige speziell auf dich zugeschnittene Tests durchführen.
          </p>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">
              Diese Tests helfen uns, deine Persönlichkeit besser zu verstehen und dir relevante Erkenntnisse zu liefern.
            </p>
          </div>
        </div>
      )
    },

    purchase: {
      title: "Erhalte deine vollständigen Ergebnisse! 🎯",
      subtitle: "Dein personalisierter Report wartet auf dich.",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
            <h3 className="font-semibold text-green-800 mb-4">Was du erhältst:</h3>
            <ul className="text-green-700 space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">📊</span>
                Detaillierte Persönlichkeitsanalyse
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">💡</span>
                Personalisierte Empfehlungen
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">🎯</span>
                Actionable Insights für dein Leben
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">📱</span>
                Zugang zur Premium-App
              </li>
            </ul>
          </div>
          
          <div className="bg-white border-2 border-blue-200 p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">19,99€</div>
            <div className="text-gray-500 mb-4">Einmalzahlung • Lebenslanger Zugang</div>
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full inline-block text-sm">
              🎉 Limitiertes Angebot: 50% Rabatt
            </div>
          </div>
        </div>
      )
    }
  }
};

// Helper functions für Survey Logic
export const getSurveyStep = (step) => {
  const config = SURVEY_CONFIG;
  
  switch(step) {
    case 1: return { type: 'static', config: config.staticPages.landing };
    case 2: return { type: 'single-choice', config: config.ageQuestion };
    case 3: return { type: 'single-choice', config: config.demographicsQuestion };
    case 4: return { type: 'multiple-choice', config: config.petsQuestion };
    case 5: return { type: 'static', config: config.staticPages.tests };
    case 6: return { type: 'multiple-choice', config: config.motivationQuestion };
    case 7: return { type: 'static', config: config.staticPages.purchase };
    case 8: return { type: 'email', config: config.emailQuestion };
    default: return null;
  }
};

// WordPress API Integration Helpers
export const formatAnswersForWordPress = (answers) => {
  return {
    age: answers.age || '',
    gender: answers.gender || '',
    demographics: answers.demographics || '',
    pets: Array.isArray(answers.pets) ? answers.pets.join(', ') : answers.pets || '',
    motivation: Array.isArray(answers.motivation) ? answers.motivation.join(', ') : answers.motivation || '',
    email: answers.email || '',
    completedAt: new Date().toISOString(),
    source: 'personality-survey'
  };
};