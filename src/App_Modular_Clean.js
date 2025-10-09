import React, { useState, useEffect } from 'react';
import { Brain, Shield, Users, Star, CheckCircle } from 'lucide-react';
import { 
  SurveyContainer, 
  SingleChoiceQuestion, 
  MultipleChoiceQuestion, 
  EmailInputQuestion, 
  StaticPageQuestion,
  SliderQuestion 
} from './components/SurveyComponents';
import { supabase, addToWaitlist, saveSurveyData, savePartialSurvey, loadPartialSurvey, clearPartialSurvey } from './config/supabase';

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
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="absolute top-0 right-0 p-6 flex space-x-3">
        {/* Supabase Status Anzeige */}
        <div className="flex items-center bg-white px-3 py-2 rounded-full shadow-lg text-xs">
          <div className={`w-2 h-2 rounded-full mr-2 ${supabase ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-600">
            {supabase ? 'Supabase verbunden' : 'Offline'}
          </span>
        </div>
      </nav>
      
      <SurveyContainer currentStep={1} totalSteps={13}>
        <StaticPageQuestion
          title="Willkommen bei MindGuard"
          subtitle="Entdecke deinen persönlichen, modulbasierten psychologischen Assistenten für präventive Betreuung und mentales Wohlbefinden."
          onNext={() => nextStep()}
          nextButtonText="Jetzt starten"
          content={
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Deine mentale Gesundheit
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    im Fokus
                  </span>
                </h1>
              </div>
              
              {/* Features Grid */}
              <div className="flex justify-center mt-12">
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
                  <div className="bg-blue-50 p-6 rounded-xl text-center">
                    <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2 text-gray-900">Präventive Hilfe</h3>
                    <p className="text-sm text-gray-600">
                      Frühzeitige Erkennung von Stresssignalen
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-xl text-center">
                    <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2 text-gray-900">Modulbasiert</h3>
                    <p className="text-sm text-gray-600">
                      Verschiedene Module für deine Bedürfnisse
                    </p>
                  </div>
                </div>
              </div>
            
            </div>
          }
        />
      </SurveyContainer>
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
            { value: '18-25', label: '18-25 Jahre' },
            { value: '26-35', label: '26-35 Jahre' },
            { value: '36-45', label: '36-45 Jahre' },
            { value: '46-55', label: '46-55 Jahre' },
            { value: '56+', label: '56+ Jahre' }
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
            { value: 'male', label: 'Männlich' },
            { value: 'female', label: 'Weiblich' },
            { value: 'diverse', label: 'Divers' }
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
            { value: 'student', label: 'Student/in' },
            { value: 'pupil', label: 'Schüler/in' },
            { value: 'employee', label: 'Angestellte/r' },
            { value: 'manager', label: 'Führungskraft' },
            { value: 'selfemployed', label: 'Selbstständig' },
            { value: 'parent', label: 'Elternteil' },
            { value: 'retired', label: 'Rentner/in' }
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
            { value: 'single', label: 'Single' },
            { value: 'dating', label: 'In einer Beziehung' },
            { value: 'recently_separated', label: 'Frisch getrennt' },
            { value: 'complicated', label: 'Es ist kompliziert' },
            { value: 'no_answer', label: 'Möchte ich nicht sagen' }
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
            { value: 'therapist', label: 'Therapeut/in oder Psycholog/in' },
            { value: 'partner', label: 'Partner/in' },
            { value: 'family', label: 'Familie (Eltern, Geschwister)' },
            { value: 'friends', label: 'Freunde/Freundinnen' },
            { value: 'online', label: 'Online-Community oder Forum' },
            { value: 'never', label: 'Noch nie mit jemandem darüber gesprochen' }
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
            { value: 'never', label: 'Noch nie' },
            { value: 'rarely', label: 'Selten (1-2 mal)' },
            { value: 'sometimes', label: 'Manchmal (3-10 mal)' },
            { value: 'regularly', label: 'Regelmäßig (mehrmals im Monat)' },
            { value: 'frequently', label: 'Häufig (mehrmals pro Woche)' },
            { value: 'daily', label: 'Täglich oder fast täglich' }
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
  const AIMotivationStep = () => (
    <div>
      <SurveyContainer currentStep={10} totalSteps={13}>
        <MultipleChoiceQuestion
          title="Weshalb sprichst du mit einer KI?"
          subtitle="Wähle alle Gründe aus, die auf dich zutreffen."
          options={[
            { value: 'available_24_7', label: 'Verfügbarkeit 24/7' },
            { value: 'no_judgment', label: 'Niemand urteilt über mich' },
            { value: 'anonymity', label: 'Anonymität' },
            { value: 'no_waiting', label: 'Keine Wartezeiten wie bei Therapeuten' },
            { value: 'cost_effective', label: 'Kostenlos/günstiger als Therapie' },
            { value: 'low_barrier', label: 'Niedrigschwelliger Einstieg' },
            { value: 'therapy_supplement', label: 'Ergänzung zu echter Therapie' },
            { value: 'curiosity', label: 'Einfach aus Neugier' },
            { value: 'immediate_response', label: 'Sofortige Antworten' },
            { value: 'practice_conversations', label: 'Um Gespräche zu üben' }
          ]}
          selectedValues={answers.ai_motivation || []}
          onToggle={(values) => updateAnswer('ai_motivation', values)}
          minSelections={1}
          onNext={() => nextStep()}
          onBack={prevStep}
        />
      </SurveyContainer>
    </div>
  );

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
            { value: 'work_stress', label: 'Stress besser bewältigen' },
            { value: 'sleep_quality', label: 'Schlafqualität verbessern' },
            { value: 'anxiety_reduction', label: 'Ängste reduzieren' },
            { value: 'self_confidence', label: 'Selbstbewusstsein stärken' },
            { value: 'relationships', label: 'Beziehungen verbessern' },
            { value: 'focus_productivity', label: 'Fokus & Produktivität steigern' },
            { value: 'emotional_balance', label: 'Emotionale Balance finden' },
            { value: 'life_direction', label: 'Lebensziele klären' },
            { value: 'mindfulness', label: 'Achtsamkeit entwickeln' },
            { value: 'already_good', label: 'Bin eigentlich zufrieden!' }
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
  const SupportStep = () => (
    <div>
      <SurveyContainer currentStep={11} totalSteps={13}>
        <MultipleChoiceQuestion
          title="Was würde dich am meisten unterstützen?"
          subtitle="Wähle alle Situationen aus, in denen du dir Unterstützung wünschst."
          options={[
            { value: 'preventive', label: 'Präventive Begleitung nach Bedarf' },
            { value: 'early_stress', label: 'Wenn ich merke, dass Stress aufkommt' },
            { value: 'sleepless', label: 'Nachts, wenn ich nicht schlafen kann' },
            { value: 'daily_checkin', label: 'Als täglicher Check-in zur Selbstreflexion' },
            { value: 'before_talking', label: 'Beim warten auf Theraphie' },
            { value: 'learning', label: 'Um mehr über mentale Gesundheit zu lernen' },
            { value: 'self_care', label: 'Zur Selbstfürsorge und persönlichen Entwicklung' },
            { value: 'none', label: 'Eigentlich in keiner' }
          ]}
          selectedValues={answers.support || []}
          onToggle={(values) => updateAnswer('support', values)}
          minSelections={1}
          onNext={() => nextStep()}
          onBack={prevStep}
          exclusiveOptions={['none']}
        />
      </SurveyContainer>
    </div>
  );

  // App Boundaries mit modularen Komponenten
  const AppBoundariesStep = () => (
    <div>
      <SurveyContainer currentStep={12} totalSteps={13}>
        <MultipleChoiceQuestion
          title="Was darf die App auf KEINEN Fall machen?"
          subtitle="Wähle alle Punkte aus, die für dich absolute No-Gos sind."
          options={[
            { value: 'fake_therapist', label: 'Sich für einen echten Therapeut ausgeben' },
            { value: 'patronizing', label: 'Mich bevormunden' },
            { value: 'generic_responses', label: 'Zu generisch antworten ("Ich verstehe dich...")' },
            { value: 'trivialize_problems', label: 'Wichtige Probleme bagatellisieren' },
            { value: 'push_notifications', label: 'Mich an Dinge erinnern' },
            { value: 'share_data', label: 'Meine Daten mit Dritten teilen' },
            { value: 'replace_human_help', label: 'Professionelle Hilfe komplett ersetzen' }
          ]}
          selectedValues={answers.app_boundaries || []}
          onToggle={(values) => updateAnswer('app_boundaries', values)}
          minSelections={1}
          onNext={() => nextStep()}
          onBack={prevStep}
        />
      </SurveyContainer>
    </div>
  );

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