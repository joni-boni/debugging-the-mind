import React, { useState, useEffect } from 'react';
import { 
  Brain, Shield, Users, Star, CheckCircle,
  // Alter Icons
  Baby, User, UserCheck, Crown, 
  // Geschlecht Icons
  UserRound, UserSquare2,
  // Demografische Icons
  GraduationCap, BookOpen, Briefcase, Laptop, Armchair, UserX, School,
  // Beziehung Icons
  Heart, HeartCrack, HelpCircle, Lock,
  // Verbesserung Icons
  Zap, Moon, ShieldAlert, TrendingUp, MessageSquare, Focus, Smile, Target, Flower,
  // Support Icons
  Stethoscope, Home, MessageCircle, Globe, X,
  // KI Erfahrung Icons
  Clock, Calendar, Repeat, RotateCcw,
  // KI Motivation Icons
  Clock3, ShieldCheck, Eye, Timer, DollarSign, ArrowDown, Plus, Lightbulb, MessageSquareText, Mic, Edit,
  // Navigation Icons
  ArrowLeft, ArrowRight,
  // Support Präferenzen Icons
  Shield as ShieldIcon, AlertTriangle, Moon as MoonIcon, CheckSquare, Hourglass, UserMinus,
  // App Grenzen Icons
  UserX as FakeTherapist, Ban, Bot, AlertCircle, Bell, Share, Hospital
} from 'lucide-react';
import { 
  SurveyContainer, 
  SingleChoiceQuestion, 
  MultipleChoiceQuestion, 
  EmailInputQuestion, 
  StaticPageQuestion,
  SliderQuestion 
} from './components/SurveyComponents';
import { supabase, addToWaitlist, saveSurveyData, savePartialSurvey, loadPartialSurvey, clearPartialSurvey } from './config/supabase';

// Einfache statische Komponente für "Sonstiges" Textfelder - außerhalb der App Komponente definiert
const SimpleTextInput = ({ value, onChange, placeholder, label, rows = 3 }) => {
  return (
    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
        rows={rows}
      />
    </div>
  );
};

function App() {
  const [currentStep, setCurrentStep] = React.useState('landing');
  const [answers, setAnswers] = React.useState({});
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showResumeDialog, setShowResumeDialog] = React.useState(false);
  const [partialSurvey, setPartialSurvey] = React.useState(null);

  // Beim App-Start prüfen ob eine gespeicherte Umfrage existiert
  React.useEffect(() => {
    const checkForPartialSurvey = async () => {
      try {
        const saved = await loadPartialSurvey();
        if (saved && saved.current_step !== 'landing' && saved.current_step !== 'success') {
          setPartialSurvey(saved);
          setShowResumeDialog(true);
        }
      } catch (error) {
        console.warn('Fehler beim Laden der gespeicherten Umfrage:', error);
      }
    };

    checkForPartialSurvey();
  }, []);

  // Gespeicherte Umfrage fortsetzen
  const resumeSurvey = () => {
    if (partialSurvey) {
      setCurrentStep(partialSurvey.current_step);
      setAnswers(partialSurvey.answers || {});
      setEmail(partialSurvey.email || '');
      setShowResumeDialog(false);
    }
  };

  // Neue Umfrage starten (gespeicherte löschen)
  const startNewSurvey = async () => {
    try {
      await clearPartialSurvey();
    } catch (error) {
      console.warn('Fehler beim Löschen der gespeicherten Umfrage:', error);
    }
    setShowResumeDialog(false);
    setCurrentStep('landing');
    setAnswers({});
    setEmail('');
  };

  const updateAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = React.useCallback(async (targetStep = null) => {
    const stepOrder = ['landing', 'age', 'gender', 'demographics', 'relationship', 'wellbeing', 'stress', 'previous_support', 'ai_experience', 'ai_motivation', 'support', 'app_boundaries', 'purchase', 'success'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    let nextStepName;
    if (targetStep) {
      nextStepName = targetStep;
    } else if (currentIndex < stepOrder.length - 1) {
      nextStepName = stepOrder[currentIndex + 1];
      
      // Spezielle Logik: Überspringe AI Motivation wenn "nie" bei AI Experience gewählt wurde
      if (currentStep === 'ai_experience' && answers.ai_experience === 'never') {
        nextStepName = 'support'; // Springe direkt zu Support (überspringt ai_motivation)
      }
    } else {
      return; // Bereits am Ende
    }
    
    // Zwischenspeicherung bei jedem Schritt (außer Landing, Success und Thankyou)
    if (currentStep !== 'landing' && currentStep !== 'success' && currentStep !== 'thankyou') {
      try {
        console.log('💾 Speichere Session für Schritt:', currentStep, 'mit Antworten:', answers);
        await savePartialSurvey(nextStepName, answers, email);
        console.log('✅ Session erfolgreich gespeichert');
      } catch (error) {
        console.warn('⚠️ Zwischenspeicherung fehlgeschlagen:', error);
        // Fehler nicht blockierend - Benutzer kann trotzdem weitermachen
      }
    }
    
    setCurrentStep(nextStepName);
  }, [currentStep, answers, email]);

  const prevStep = React.useCallback(() => {
    const stepOrder = ['landing', 'age', 'gender', 'demographics', 'relationship', 'wellbeing', 'stress', 'previous_support', 'ai_experience', 'ai_motivation', 'support', 'app_boundaries', 'purchase', 'success'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex > 0) {
      let prevStepName = stepOrder[currentIndex - 1];
      
      // Spezielle Logik: Wenn wir bei Support sind und AI Experience "never" war, springe zurück zu AI Experience
      if (currentStep === 'support' && answers.ai_experience === 'never') {
        prevStepName = 'ai_experience';
      }
      
      setCurrentStep(prevStepName);
    }
  }, [currentStep, answers.ai_experience]);

  const handleEmailChange = React.useCallback((newEmail) => {
    setEmail(newEmail);
  }, []);

  const handleFinalSubmit = async () => {
    if (!email) return; // Safety check
    
    setIsSubmitting(true);
    try {
      // Beide Aktionen parallel ausführen
      const surveyData = { ...answers, email };
      
      await Promise.all([
        // E-Mail zur Warteliste hinzufügen
        addToWaitlist(email, answers),
        // Survey-Daten strukturiert speichern
        saveSurveyData(surveyData)
      ]);
      
      console.log('Survey Results submitted to Supabase:', surveyData);
      
      // Zwischenspeicherung löschen nach erfolgreichem Abschluss
      await clearPartialSurvey();
      
      alert('Vielen Dank! Deine Antworten wurden erfolgreich gespeichert.');
      setCurrentStep('thankyou');
    } catch (error) {
      console.error('Error submitting to Supabase:', error);
      
      // Lokale Speicherung als Fallback
      try {
        const surveyData = { ...answers, email };
        const existingData = JSON.parse(localStorage.getItem('pendingSurveyResponses') || '[]');
        existingData.push({
          ...surveyData,
          localId: Date.now(),
          savedAt: new Date().toISOString()
        });
        localStorage.setItem('pendingSurveyResponses', JSON.stringify(existingData));
        
        alert('Deine Antworten wurden lokal gespeichert und werden automatisch synchronisiert, sobald die Verbindung wieder hergestellt ist.');
      } catch (localError) {
        console.error('Local storage failed:', localError);
        alert('Es gab einen Fehler beim Speichern. Bitte versuche es erneut.');
      }
      
      // Still proceed to thank you page
      setCurrentStep('thankyou');
    } finally {
      setIsSubmitting(false);
    }
  };



  // Enhanced Landing Component mit modularen Komponenten
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          {/* Content */}
          <div className="text-center">
            {/* Hero Section - Ultra kompakt für kleine Bildschirme */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <div className="flex justify-center mb-2 sm:mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 sm:p-3 md:p-4 rounded-full">
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-white" />
                </div>
              </div>
              
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 md:mb-4 leading-tight">
                Willkommen bei MindGuard
              </h1>
              
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4 md:mb-6 px-2">
                Entdecke deinen persönlichen, modulbasierten psychologischen Assistenten für präventive Betreuung und mentales Wohlbefinden.
              </p>
            </div>
            
            {/* Features Grid - Ultra kompakt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
              <div className="bg-blue-50 p-3 sm:p-4 md:p-6 rounded-xl text-center">
                <div className="bg-blue-100 p-1.5 sm:p-2 md:p-3 rounded-full w-fit mx-auto mb-2 sm:mb-3 md:mb-4">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1 text-gray-900 text-xs sm:text-sm md:text-base">Präventive Hilfe</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Frühzeitige Erkennung von Stresssignalen
                </p>
              </div>
              
              <div className="bg-green-50 p-3 sm:p-4 md:p-6 rounded-xl text-center">
                <div className="bg-green-100 p-1.5 sm:p-2 md:p-3 rounded-full w-fit mx-auto mb-2 sm:mb-3 md:mb-4">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1 text-gray-900 text-xs sm:text-sm md:text-base">Modulbasiert</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Verschiedene Module für deine Bedürfnisse
                </p>
              </div>
            </div>

            {/* Button */}
            <div className="flex justify-end">
              <button
                onClick={() => nextStep()}
                className="w-full sm:w-auto flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Jetzt starten
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Age Selection mit modularen Komponenten
  const AgeStep = () => (
    <div>
      <SurveyContainer currentStep={2} totalSteps={13}>
        <SingleChoiceQuestion
          title="Wie alt bist du?"
          subtitle="Dies hilft uns, passende Inhalte für dich zu finden."
          options={[
            { value: 'under-18', label: 'Unter 18 Jahre', icon: School },
            { value: '18-25', label: '18-25 Jahre', icon: User },
            { value: '26-35', label: '26-35 Jahre', icon: UserCheck },
            { value: '36-45', label: '36-45 Jahre', icon: Briefcase },
            { value: '46-55', label: '46-55 Jahre', icon: Crown },
            { value: '56+', label: '56+ Jahre', icon: Armchair }
          ]}
          selectedValue={answers.age}
          onSelect={(value) => updateAnswer('age', value)}
          onNext={() => nextStep()}
          onBack={() => setCurrentStep('landing')}
        />
      </SurveyContainer>
    </div>
  );

  // Gender Selection
  const GenderStep = () => (
    <div>
      <SurveyContainer currentStep={3} totalSteps={13}>
        <SingleChoiceQuestion
          title="Welches Geschlecht hast du?"
          subtitle="Diese Information hilft uns bei der personalisierten Analyse."
          options={[
            { value: 'male', label: 'Männlich', icon: UserRound },
            { value: 'female', label: 'Weiblich', icon: UserSquare2 },
            { value: 'diverse', label: 'Divers', icon: Users }
          ]}
          selectedValue={answers.gender}
          onSelect={(value) => updateAnswer('gender', value)}
          onNext={() => nextStep()}
          onBack={() => nextStep('age')}
        />
      </SurveyContainer>
    </div>
  );

  // Demographic mit modularen Komponenten
  const DemographicStep = () => (
    <div>
      <SurveyContainer currentStep={4} totalSteps={13}>
        <SingleChoiceQuestion
          title="Was beschreibt dich am besten?"
          subtitle="So können wir dir relevantere Inhalte bieten."
          options={[
            { value: 'student', label: 'Student/in', icon: GraduationCap },
            { value: 'pupil', label: 'Schüler/in', icon: BookOpen },
            { value: 'employee', label: 'Angestellte/r', icon: Briefcase },
            { value: 'manager', label: 'Führungskraft', icon: Crown },
            { value: 'selfemployed', label: 'Selbstständig', icon: Laptop },
            { value: 'parent', label: 'Elternteil', icon: Baby },
            { value: 'retired', label: 'Rentner/in', icon: Armchair }
          ]}
          selectedValue={answers.demographics}
          onSelect={(value) => updateAnswer('demographics', value)}
          onNext={() => nextStep()}
          onBack={() => nextStep('gender')}
        />
      </SurveyContainer>
    </div>
  );

  // Relationship Status mit modularen Komponenten
  const RelationshipStep = () => (
    <div>
      <SurveyContainer currentStep={5} totalSteps={13}>
        <SingleChoiceQuestion
          title="Wie ist dein Beziehungsstatus?"
          subtitle="Diese Information hilft uns, dir passende Inhalte zu empfehlen."
          options={[
            { value: 'single', label: 'Single', icon: User },
            { value: 'dating', label: 'In einer Beziehung', icon: Heart },
            { value: 'recently_separated', label: 'Frisch getrennt', icon: HeartCrack },
            { value: 'complicated', label: 'Es ist kompliziert', icon: HelpCircle },
            { value: 'no_answer', label: 'Möchte ich nicht sagen', icon: Lock }
          ]}
          selectedValue={answers.relationship}
          onSelect={(value) => updateAnswer('relationship', value)}
          onNext={() => nextStep()}
          onBack={prevStep}
        />
      </SurveyContainer>
    </div>
  );

  // Previous Support Experience mit modularen Komponenten
  const PreviousSupportStep = () => (
    <div>
      <SurveyContainer currentStep={8} totalSteps={13}>
        <MultipleChoiceQuestion
          title="Hast du schon mal mit jemandem über persönliche Probleme gesprochen?"
          subtitle="Wähle alle aus, mit denen du bereits über schwierige Themen geredet hast."
          options={[
            { value: 'therapist', label: 'Therapeut/in oder Psycholog/in', icon: Stethoscope },
            { value: 'partner', label: 'Partner/in', icon: Heart },
            { value: 'family', label: 'Familie (Eltern, Geschwister)', icon: Home },
            { value: 'friends', label: 'Freunde/Freundinnen', icon: MessageCircle },
            { value: 'online', label: 'Online-Community oder Forum', icon: Globe },
            { value: 'never', label: 'Noch nie mit jemandem darüber gesprochen', icon: X }
          ]}
          selectedValues={answers.previous_support || []}
          onToggle={(values) => updateAnswer('previous_support', values)}
          minSelections={1}
          onNext={() => nextStep()}
          onBack={prevStep}
          exclusiveOptions={['never']}
        />
      </SurveyContainer>
    </div>
  );

  // AI Experience mit modularen Komponenten
  const AIExperienceStep = () => (
    <div>
      <SurveyContainer currentStep={9} totalSteps={13}>
        <SingleChoiceQuestion
          title="Hast du schon einmal mit einer KI über persönliche Dinge gesprochen?"
          subtitle="Zum Beispiel mit ChatGPT, Claude, Bard oder anderen KI-Assistenten."
          options={[
            { value: 'never', label: 'Noch nie', icon: X },
            { value: 'rarely', label: 'Selten (1-2 mal)', icon: Clock },
            { value: 'sometimes', label: 'Manchmal (3-10 mal)', icon: Clock3 },
            { value: 'regularly', label: 'Regelmäßig (mehrmals im Monat)', icon: Calendar },
            { value: 'frequently', label: 'Häufig (mehrmals pro Woche)', icon: Repeat },
            { value: 'daily', label: 'Täglich oder fast täglich', icon: RotateCcw }
          ]}
          selectedValue={answers.ai_experience}
          onSelect={(value) => updateAnswer('ai_experience', value)}
          onNext={() => nextStep()}
          onBack={prevStep}
        />
      </SurveyContainer>
    </div>
  );

  // AI Motivation mit modularen Komponenten
  const AIMotivationStep = () => {
    const [otherText, setOtherText] = React.useState(answers.ai_motivation_other || '');
    const selectedValues = answers.ai_motivation || [];
    const showOtherInput = selectedValues.includes('other');

    const handleToggle = (values) => {
      updateAnswer('ai_motivation', values);
      if (!values.includes('other')) {
        // Wenn "Sonstiges" abgewählt wird, den Text löschen
        setOtherText('');
        updateAnswer('ai_motivation_other', '');
      }
    };

    const handleOtherTextChange = (value) => {
      setOtherText(value);
      updateAnswer('ai_motivation_other', value);
    };

    return (
      <div>
        <SurveyContainer currentStep={10} totalSteps={13}>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Weshalb sprichst du mit einer KI?</h1>
            <p className="text-gray-600 mb-8">Wähle alle Gründe aus, die auf dich zutreffen.</p>
            
            <div className="space-y-3 mb-8">
              {[
                { value: 'available_24_7', label: 'Verfügbarkeit 24/7', icon: Clock3 },
                { value: 'no_judgment', label: 'Niemand urteilt über mich', icon: ShieldCheck },
                { value: 'anonymity', label: 'Anonymität', icon: Eye },
                { value: 'no_waiting', label: 'Keine Wartezeiten wie bei Therapeuten', icon: Timer },
                { value: 'cost_effective', label: 'Kostenlos/günstiger als Therapie', icon: DollarSign },
                { value: 'low_barrier', label: 'Niedrigschwelliger Einstieg', icon: ArrowDown },
                { value: 'therapy_supplement', label: 'Ergänzung zu echter Therapie', icon: Plus },
                { value: 'curiosity', label: 'Einfach aus Neugier', icon: Lightbulb },
                { value: 'immediate_response', label: 'Sofortige Antworten', icon: MessageSquareText },
                { value: 'practice_conversations', label: 'Um Gespräche zu üben', icon: Mic },
                { value: 'other', label: 'Sonstiges', icon: Edit }
              ].map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      const newValues = isSelected 
                        ? selectedValues.filter(v => v !== option.value)
                        : [...selectedValues, option.value];
                      handleToggle(newValues);
                    }}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 flex-shrink-0">
                        {React.createElement(option.icon, { 
                          className: `w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}` 
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{option.label}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Freitextfeld für "Sonstiges" */}
            {showOtherInput && (
              <SimpleTextInput
                value={otherText}
                onChange={handleOtherTextChange}
                placeholder="Beschreibe hier deinen Grund..."
                label="Bitte beschreibe deinen Grund genauer:"
                rows={3}
              />
            )}

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </button>
              <button
                onClick={() => nextStep()}
                disabled={selectedValues.length === 0 || (showOtherInput && !otherText.trim())}
                className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all ${
                  selectedValues.length > 0 && (!showOtherInput || otherText.trim())
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Weiter
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </SurveyContainer>
      </div>
    );
  };

  // Wellbeing Slider mit modularen Komponenten
  const WellbeingStep = () => {
    // Setze Standardwert, falls noch nicht gesetzt
    React.useEffect(() => {
      if (answers.wellbeing === undefined) {
        updateAnswer('wellbeing', 5);
      }
    }, []);

    return (
      <div>
        <SurveyContainer currentStep={6} totalSteps={13}>
          <SliderQuestion
            title="Wie geht es dir gerade?"
            subtitle="Bewerte dein aktuelles Wohlbefinden auf einer Skala von 1 bis 10."
            min={1}
            max={10}
            value={answers.wellbeing || 5}
            onChange={(value) => updateAnswer('wellbeing', value)}
          onNext={() => nextStep()}
          onBack={prevStep}
          leftLabel="Sehr schlecht"
          rightLabel="Sehr gut"
        />
      </SurveyContainer>
    </div>
  );
};

  // Verbesserung Bereiche mit modularen Komponenten
  const ImprovementStep = () => (
    <div>
      <SurveyContainer currentStep={7} totalSteps={13}>
        <MultipleChoiceQuestion
          title="Was willst du verbessern?"
          subtitle="Wähle alle Bereiche aus, an denen du arbeiten möchtest."
          options={[
            { value: 'work_stress', label: 'Stress besser bewältigen', icon: Zap },
            { value: 'sleep_quality', label: 'Schlafqualität verbessern', icon: Moon },
            { value: 'anxiety_reduction', label: 'Ängste reduzieren', icon: ShieldAlert },
            { value: 'self_confidence', label: 'Selbstbewusstsein stärken', icon: TrendingUp },
            { value: 'relationships', label: 'Beziehungen verbessern', icon: MessageSquare },
            { value: 'focus_productivity', label: 'Fokus & Produktivität steigern', icon: Focus },
            { value: 'emotional_balance', label: 'Emotionale Balance finden', icon: Smile },
            { value: 'life_direction', label: 'Lebensziele klären', icon: Target },
            { value: 'mindfulness', label: 'Achtsamkeit entwickeln', icon: Flower },
            { value: 'already_good', label: 'Bin eigentlich zufrieden!', icon: CheckCircle }
          ]}
          selectedValues={answers.improvements || []}
          onToggle={(values) => updateAnswer('improvements', values)}
          minSelections={1}
          onNext={() => nextStep()}
          onBack={prevStep}
          exclusiveOptions={['already_good']}
        />
      </SurveyContainer>
    </div>
  );

  // Support Präferenzen mit modularen Komponenten
  const SupportStep = () => {
    const [otherText, setOtherText] = React.useState(answers.support_other || '');
    const selectedValues = answers.support || [];
    const showOtherInput = selectedValues.includes('other');

    const handleToggle = (values) => {
      updateAnswer('support', values);
      if (!values.includes('other')) {
        // Wenn "Sonstiges" abgewählt wird, den Text löschen
        setOtherText('');
        updateAnswer('support_other', '');
      }
    };

    const handleOtherTextChange = (value) => {
      setOtherText(value);
      updateAnswer('support_other', value);
    };

    return (
      <div>
        <SurveyContainer currentStep={11} totalSteps={13}>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Was würde dich am meisten unterstützen?</h1>
            <p className="text-gray-600 mb-8">Wähle alle Situationen aus, in denen du dir Unterstützung wünschst.</p>
            
            <div className="space-y-3 mb-8">
              {[
                { value: 'preventive', label: 'Präventive Begleitung nach Bedarf', icon: ShieldIcon },
                { value: 'early_stress', label: 'Wenn ich merke, dass Stress aufkommt', icon: AlertTriangle },
                { value: 'sleepless', label: 'Nachts, wenn ich nicht schlafen kann', icon: MoonIcon },
                { value: 'daily_checkin', label: 'Als täglicher Check-in zur Selbstreflexion', icon: CheckSquare },
                { value: 'before_talking', label: 'Beim warten auf Theraphie', icon: Hourglass },
                { value: 'learning', label: 'Um mehr über mentale Gesundheit zu lernen', icon: BookOpen },
                { value: 'self_care', label: 'Zur Selbstfürsorge und persönlichen Entwicklung', icon: Flower },
                { value: 'none', label: 'Eigentlich in keiner', icon: UserMinus },
                { value: 'other', label: 'Sonstiges', icon: Edit }
              ].map((option) => {
                const isSelected = selectedValues.includes(option.value);
                const isDisabled = !isSelected && selectedValues.includes('none') && option.value !== 'none';
                
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      let newValues;
                      if (option.value === 'none') {
                        // Wenn "none" gewählt wird, nur "none" auswählen
                        newValues = isSelected ? [] : ['none'];
                      } else if (isSelected) {
                        // Option abwählen
                        newValues = selectedValues.filter(v => v !== option.value);
                      } else {
                        // Option hinzufügen und "none" entfernen falls vorhanden
                        newValues = [...selectedValues.filter(v => v !== 'none'), option.value];
                      }
                      handleToggle(newValues);
                    }}
                    disabled={isDisabled}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 flex-shrink-0">
                        {React.createElement(option.icon, { 
                          className: `w-5 h-5 ${
                            isSelected 
                              ? 'text-blue-600' 
                              : isDisabled 
                              ? 'text-gray-400' 
                              : 'text-gray-500'
                          }` 
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{option.label}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Freitextfeld für "Sonstiges" */}
            {showOtherInput && (
              <SimpleTextInput
                value={otherText}
                onChange={handleOtherTextChange}
                placeholder="Beschreibe hier, in welcher Situation du dir Unterstützung wünschst..."
                label="Bitte beschreibe deine Situation genauer:"
                rows={3}
              />
            )}

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </button>
              <button
                onClick={() => nextStep()}
                disabled={selectedValues.length === 0 || (showOtherInput && !otherText.trim())}
                className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all ${
                  selectedValues.length > 0 && (!showOtherInput || otherText.trim())
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Weiter
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </SurveyContainer>
      </div>
    );
  };

  // App Boundaries mit modularen Komponenten
  const AppBoundariesStep = () => {
    const [otherText, setOtherText] = React.useState(answers.app_boundaries_other || '');
    const selectedValues = answers.app_boundaries || [];
    const showOtherInput = selectedValues.includes('other');

    const handleToggle = (values) => {
      updateAnswer('app_boundaries', values);
      if (!values.includes('other')) {
        // Wenn "Sonstiges" abgewählt wird, den Text löschen
        setOtherText('');
        updateAnswer('app_boundaries_other', '');
      }
    };

    const handleOtherTextChange = (value) => {
      setOtherText(value);
      updateAnswer('app_boundaries_other', value);
    };

    return (
      <div>
        <SurveyContainer currentStep={12} totalSteps={13}>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Was darf die App auf KEINEN Fall machen?</h1>
            <p className="text-gray-600 mb-8">Wähle alle Punkte aus, die für dich absolute No-Gos sind.</p>
            
            <div className="space-y-3 mb-8">
              {[
                { value: 'fake_therapist', label: 'Sich für einen echten Therapeut ausgeben', icon: UserX },
                { value: 'patronizing', label: 'Mich bevormunden', icon: Ban },
                { value: 'generic_responses', label: 'Zu generisch antworten ("Ich verstehe dich...")', icon: Bot },
                { value: 'trivialize_problems', label: 'Wichtige Probleme bagatellisieren', icon: AlertCircle },
                { value: 'push_notifications', label: 'Mich an Dinge erinnern', icon: Bell },
                { value: 'share_data', label: 'Meine Daten mit Dritten teilen', icon: Share },
                { value: 'replace_human_help', label: 'Professionelle Hilfe komplett ersetzen', icon: Hospital },
                { value: 'other', label: 'Sonstiges', icon: Edit }
              ].map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      const newValues = isSelected 
                        ? selectedValues.filter(v => v !== option.value)
                        : [...selectedValues, option.value];
                      handleToggle(newValues);
                    }}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 flex-shrink-0">
                        {React.createElement(option.icon, { 
                          className: `w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}` 
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{option.label}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Freitextfeld für "Sonstiges" */}
            {showOtherInput && (
              <SimpleTextInput
                value={otherText}
                onChange={handleOtherTextChange}
                placeholder="Beschreibe hier, was die App auf keinen Fall machen sollte..."
                label="Bitte beschreibe dein No-Go genauer:"
                rows={3}
              />
            )}

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </button>
              <button
                onClick={() => nextStep()}
                disabled={selectedValues.length === 0 || (showOtherInput && !otherText.trim())}
                className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all ${
                  selectedValues.length > 0 && (!showOtherInput || otherText.trim())
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Weiter
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </SurveyContainer>
      </div>
    );
  };

  // Purchase mit modularen Komponenten
  const PurchaseStep = () => (
    <div>
      <SurveyContainer currentStep={13} totalSteps={13}>
        <StaticPageQuestion
          title="Perfekt! 🎯"
          subtitle="Basierend auf deinen Angaben haben wir das ideale Paket für dich zusammengestellt."
          onNext={() => nextStep()}
          onBack={prevStep}
          showBack={true}
          nextButtonText="Weiter zur App"
          content={
            <div className="space-y-6">
              {/* App Features */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white">
                <h3 className="text-xl font-semibold mb-4">Dein MindGuard</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Personalisierte KI-Begleitung
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Basierend auf deinen Antworten angepasst
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verfügbar wann du es brauchst
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Psychologisch fundiert & validiert
                  </li>
                </ul>
              </div>
              
              {/* Next Steps */}
              <div className="text-center bg-gray-50 p-4 rounded-xl">
                <div className="text-lg font-semibold text-gray-900 mb-2">Bereit für den nächsten Schritt?</div>
                <div className="text-sm text-gray-600">Deine personalisierte Begleitung wartet auf dich</div>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Du wirst zur App weitergeleitet, um deine personalisierte MindGuard AI zu starten.
              </p>
            </div>
          }
        />
      </SurveyContainer>
    </div>
  );

  // Success/Email Collection mit modularen Komponenten
  const SuccessStep = () => (
    <div>
      <SurveyContainer currentStep={13} totalSteps={13}>
        <EmailInputQuestion
          title="Danke dass du alle Fragen beantwortet hast! �"
          subtitle="Wir befinden uns in der Pilotphase und können leider keine neuen Nutzer mehr aufnehmen. Trage dich gerne in die Warteliste ein, um informiert zu werden, sobald wir wieder Plätze frei haben."
          initialEmail={email}
          showCheckboxes={true}
          onSubmit={async (userEmail, checkboxes) => {
            if (!userEmail) return;
            
            setEmail(userEmail);
            setIsSubmitting(true);
            
            try {
              // Beide Aktionen parallel ausführen
              const surveyData = { 
                ...answers, 
                email: userEmail,
                newsletter: checkboxes?.newsletter || false,
                interview: checkboxes?.interview || false
              };
              
              await Promise.all([
                // E-Mail zur Warteliste hinzufügen
                addToWaitlist(userEmail, answers),
                // Survey-Daten strukturiert speichern
                saveSurveyData(surveyData)
              ]);
              
              console.log('Survey Results submitted to Supabase:', surveyData);
              
              alert('Vielen Dank! Deine Antworten wurden erfolgreich gespeichert.');
              setCurrentStep('thankyou');
            } catch (error) {
              console.error('Error submitting to Supabase:', error);
              alert('Es gab einen Fehler beim Speichern. Bitte versuche es erneut.');
            }
            
            setIsSubmitting(false);
          }}
          onBack={prevStep}
          showBack={true}
          submitButtonText="Zugang erhalten"
          isSubmitting={isSubmitting}
        />
      </SurveyContainer>
    </div>
  );

  // Thank You Page
  const ThankYouStep = () => (
    <div>
      <SurveyContainer currentStep={13} totalSteps={13}>
        <StaticPageQuestion
          title="Vielen Dank!"
          subtitle="Du hast dich erfolgreich registriert."
          content={
            <div className="text-center space-y-6">
              <div className="bg-green-100 p-4 rounded-full w-fit mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">
                Wir werden dich in Kürze über den Launch informieren!
              </p>
              <div className="text-sm text-gray-500 mb-4">
                Halte Ausschau nach unserer E-Mail mit weiteren Details.
              </div>
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <p className="text-gray-700 leading-relaxed">
                  Viele Grüße<br />
                  <span className="font-semibold text-indigo-600">dein Team aus den zwei schönsten Städten mit M</span><br />
                  <span className="text-sm text-gray-500">(Mainz und München)</span>
                </p>
              </div>

            </div>
          }
          customButton={null} // Kein Standard Button
        />
      </SurveyContainer>
    </div>
  );

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'landing':
        return <LandingPage />;
      case 'age':
        return <AgeStep />;
      case 'gender':
        return <GenderStep />;
      case 'demographics':
        return <DemographicStep />;
      case 'relationship':
        return <RelationshipStep />;
      case 'previous_support':
        return <PreviousSupportStep />;
      case 'ai_experience':
        return <AIExperienceStep />;
      case 'ai_motivation':
        return <AIMotivationStep />;
      case 'wellbeing':
        return <WellbeingStep />;
      case 'stress':
        return <ImprovementStep />;
      case 'support':
        return <SupportStep />;
      case 'app_boundaries':
        return <AppBoundariesStep />;
      case 'purchase':
        return <PurchaseStep />;
      case 'success':
        return <SuccessStep />;
      case 'thankyou':
        return <ThankYouStep />;
      default:
        return <LandingPage />;
    }
  };



  // Resume Dialog Component
  const ResumeDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Umfrage fortsetzen?
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Wir haben eine angefangene Umfrage gefunden. Möchtest du dort weitermachen oder neu starten?
          </p>
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <button
              onClick={resumeSurvey}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Fortsetzen
            </button>
            <button
              onClick={startNewSurvey}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Neu starten
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      {showResumeDialog && <ResumeDialog />}
      {renderCurrentStep()}
    </div>
  );
}

export default App;