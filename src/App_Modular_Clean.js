import React, { useState, useEffect } from 'react';
import { Brain, Shield, Users, Star, CheckCircle } from 'lucide-react';
import { 
  SurveyContainer, 
  SingleChoiceQuestion, 
  MultipleChoiceQuestion, 
  EmailInputQuestion, 
  StaticPageQuestion 
} from './components/SurveyComponents';
import { supabase, addToWaitlist, saveSurveyData } from './config/supabase';

const PsychAILanding = () => {
  const [currentStep, setCurrentStep] = useState('landing');
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);



  const updateAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = React.useCallback((stepName) => {
    setCurrentStep(stepName);
  }, []);

  const prevStep = React.useCallback(() => {
    const stepOrder = ['landing', 'age', 'gender', 'demographics', 'pets', 'tests', 'motivation', 'purchase', 'success'];
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
      
      alert('🎉 Vielen Dank! Ihre Antworten wurden erfolgreich in Supabase gespeichert.');
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
        
        alert('📱 Ihre Antworten wurden lokal gespeichert und werden automatisch synchronisiert, sobald die Verbindung wieder hergestellt ist.');
      } catch (localError) {
        console.error('Local storage failed:', localError);
        alert('❌ Es gab einen Fehler beim Speichern. Bitte versuchen Sie es erneut.');
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
      
      <SurveyContainer currentStep={1} totalSteps={8}>
        <StaticPageQuestion
          title="Willkommen zu MindGuard AI! 🧠"
          subtitle="Entdecken Sie Ihren persönlichen, modulbasierten psychologischen Assistenten für präventive Betreuung und mentales Wohlbefinden."
          onNext={() => nextStep('age')}
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
                  Ihre mentale Gesundheit
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    im Fokus
                  </span>
                </h1>
              </div>
              
              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="bg-blue-50 p-6 rounded-xl text-center">
                  <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-900">Präventive Betreuung</h3>
                  <p className="text-sm text-gray-600">
                    Frühzeitige Erkennung von Stresssignalen
                  </p>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-xl text-center">
                  <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-900">KI-gestützt</h3>
                  <p className="text-sm text-gray-600">
                    Personalisierte Empfehlungen durch moderne KI
                  </p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-xl text-center">
                  <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-900">Modulbasiert</h3>
                  <p className="text-sm text-gray-600">
                    Verschiedene Module für Ihre Bedürfnisse
                  </p>
                </div>
              </div>
              
              {/* Social Proof */}
              <div className="text-center mt-8">
                <p className="text-gray-500 mb-4">Bereits über 1.000 Beta-Nutzer vertrauen auf MindGuard AI</p>
                <div className="flex justify-center items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-gray-600 text-sm font-medium">4.8/5 Bewertung</span>
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
      <SurveyContainer currentStep={2} totalSteps={8}>
        <SingleChoiceQuestion
          title="Wie alt sind Sie?"
          subtitle="Dies hilft uns, passende Inhalte für Sie zu finden."
          options={[
            { value: '18-25', label: '18-25 Jahre' },
            { value: '26-35', label: '26-35 Jahre' },
            { value: '36-45', label: '36-45 Jahre' },
            { value: '46-55', label: '46-55 Jahre' },
            { value: '56+', label: '56+ Jahre' }
          ]}
          selectedValue={answers.age}
          onSelect={(value) => updateAnswer('age', value)}
          onNext={() => nextStep('gender')}
          onBack={() => nextStep('landing')}
        />
      </SurveyContainer>
    </div>
  );

  // Gender Selection
  const GenderStep = () => (
    <div>
      <SurveyContainer currentStep={3} totalSteps={8}>
        <SingleChoiceQuestion
          title="Welches Geschlecht haben Sie?"
          subtitle="Diese Information hilft uns bei der personalisierten Analyse."
          options={[
            { value: 'male', label: 'Männlich' },
            { value: 'female', label: 'Weiblich' },
            { value: 'diverse', label: 'Divers' }
          ]}
          selectedValue={answers.gender}
          onSelect={(value) => updateAnswer('gender', value)}
          onNext={() => nextStep('demographics')}
          onBack={() => nextStep('age')}
        />
      </SurveyContainer>
    </div>
  );

  // Demographic mit modularen Komponenten
  const DemographicStep = () => (
    <div>
      <SurveyContainer currentStep={4} totalSteps={8}>
        <SingleChoiceQuestion
          title="Was beschreibt Sie am besten?"
          subtitle="So können wir Ihnen relevantere Inhalte bieten."
          options={[
            { value: 'student', label: 'Student/in' },
            { value: 'employee', label: 'Angestellte/r' },
            { value: 'manager', label: 'Führungskraft' },
            { value: 'selfemployed', label: 'Selbstständig' },
            { value: 'parent', label: 'Elternteil' },
            { value: 'retired', label: 'Rentner/in' }
          ]}
          selectedValue={answers.demographics}
          onSelect={(value) => updateAnswer('demographics', value)}
          onNext={() => nextStep('pets')}
          onBack={() => nextStep('gender')}
        />
      </SurveyContainer>
    </div>
  );

  // Pets mit modularen Komponenten
  const PetsStep = () => (
    <div>
      <SurveyContainer currentStep={4} totalSteps={8}>
        <MultipleChoiceQuestion
          title="Haben Sie Haustiere?"
          subtitle="Haustiere können eine wichtige Rolle für das Wohlbefinden spielen. Wählen Sie alle zutreffenden aus."
          options={[
            { value: 'dogs', label: '🐕 Hunde' },
            { value: 'cats', label: '🐱 Katzen' },
            { value: 'rabbits', label: '🐰 Kaninchen' },
            { value: 'reptiles', label: '🦎 Reptilien' },
            { value: 'birds', label: '🐦 Vögel' },
            { value: 'fish', label: '🐠 Fische' },
            { value: 'none', label: '❌ Keine Haustiere' }
          ]}
          selectedValues={answers.pets || []}
          onToggle={(values) => updateAnswer('pets', values)}
          onNext={() => nextStep('tests')}
          onBack={prevStep}
          exclusiveOptions={['none']}
        />
      </SurveyContainer>
    </div>
  );

  // Tests Placeholder mit modularen Komponenten
  const TestStep = () => (
    <div>
      <SurveyContainer currentStep={5} totalSteps={8}>
        <StaticPageQuestion
          title="Ihre Tests starten gleich! 🧪"
          subtitle="Bereite Sie sich auf spannende Einblicke vor."
          onNext={() => nextStep('motivation')}
          onBack={prevStep}
          showBack={true}
          content={
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl text-center">
              <div className="text-6xl mb-4">🔬</div>
              <p className="text-gray-600 mb-6">
                Basierend auf Ihren bisherigen Antworten werden wir nun einige speziell auf Sie zugeschnittene Tests durchführen.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">
                  Diese Tests helfen uns, Ihre Persönlichkeit besser zu verstehen und Ihnen relevante Erkenntnisse zu liefern.
                </p>
              </div>
            </div>
          }
        />
      </SurveyContainer>
    </div>
  );

  // Motivation mit modularen Komponenten
  const MotivationStep = () => (
    <div>
      <SurveyContainer currentStep={6} totalSteps={8}>
        <MultipleChoiceQuestion
          title="Was möchten Sie erreichen?"
          subtitle="Wählen Sie Ihre Hauptziele aus (bis zu 3 möglich)."
          options={[
            { value: 'stress', label: '😮‍💨 Stress besser bewältigen' },
            { value: 'sleep', label: '😴 Schlafqualität verbessern' },
            { value: 'anxiety', label: '😰 Ängste reduzieren' },
            { value: 'focus', label: '🎯 Konzentration steigern' },
            { value: 'mood', label: '😊 Stimmung stabilisieren' },
            { value: 'relationships', label: '💕 Beziehungen verbessern' },
            { value: 'prevention', label: '🛡️ Präventive Vorsorge' }
          ]}
          selectedValues={answers.motivation || []}
          onToggle={(values) => updateAnswer('motivation', values)}
          onNext={() => nextStep('purchase')}
          onBack={prevStep}
          maxSelections={3}
          minSelections={1}
          nextButtonText="Weiter zur Bestellung"
        />
      </SurveyContainer>
    </div>
  );

  // Purchase mit modularen Komponenten
  const PurchaseStep = () => (
    <div>
      <SurveyContainer currentStep={7} totalSteps={8}>
        <StaticPageQuestion
          title="Perfekt! 🎯"
          subtitle="Basierend auf Ihren Angaben haben wir das ideale Paket für Sie zusammengestellt."
          onNext={() => nextStep('success')}
          onBack={prevStep}
          showBack={true}
          nextButtonText="Jetzt für €49 kaufen"
          content={
            <div className="space-y-6">
              {/* Package Details */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white">
                <h3 className="text-xl font-semibold mb-4">MindGuard AI Premium</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Personalisierte KI-Analyse
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {(answers.motivation?.length || 1)} ausgewählte Module
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    24/7 verfügbarer Support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Wöchentliche Fortschrittsberichte
                  </li>
                </ul>
              </div>
              
              {/* Pricing */}
              <div className="text-center">
                <div className="text-gray-500 line-through text-lg">€79</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">€49</div>
                <div className="text-sm text-gray-600">Einmaliger Preis • 30 Tage Geld-zurück-Garantie</div>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Nach dem Kauf erhalten Sie Zugang zu Ihrer personalisierten MindGuard AI Plattform.
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
      <SurveyContainer currentStep={8} totalSteps={8}>
        <EmailInputQuestion
          title="Aufgrund der hohen Nachfrage nur noch Wartelistenplätze 📧"
          subtitle="Wir befinden uns aktuell in der Beta-Phase. Geben Sie Ihre E-Mail-Adresse ein, um sich für die Warteliste und Newsletter anzumelden."
          initialEmail={email}
          onSubmit={async (userEmail) => {
            if (!userEmail) return;
            
            setEmail(userEmail);
            setIsSubmitting(true);
            
            try {
              // Beide Aktionen parallel ausführen
              const surveyData = { ...answers, email: userEmail };
              
              await Promise.all([
                // E-Mail zur Warteliste hinzufügen
                addToWaitlist(userEmail, answers),
                // Survey-Daten strukturiert speichern
                saveSurveyData(surveyData)
              ]);
              
              console.log('Survey Results submitted to Supabase:', surveyData);
              
              alert('🎉 Vielen Dank! Ihre Antworten wurden erfolgreich in Supabase gespeichert.');
              setCurrentStep('thankyou');
            } catch (error) {
              console.error('Error submitting to Supabase:', error);
              alert('⚠️ Es gab einen Fehler beim Speichern. Bitte versuchen Sie es erneut.');
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
      <SurveyContainer currentStep={8} totalSteps={8}>
        <StaticPageQuestion
          title="Vielen Dank! 🎉"
          subtitle="Sie haben sich erfolgreich registriert."
          content={
            <div className="text-center space-y-6">
              <div className="bg-green-100 p-4 rounded-full w-fit mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 mb-6">
                Wir werden Sie in Kürze über den Launch informieren!
              </p>
              <div className="text-sm text-gray-500">
                Halten Sie Ausschau nach unserer E-Mail mit weiteren Details.
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
      case 'pets':
        return <PetsStep />;
      case 'tests':
        return <TestStep />;
      case 'motivation':
        return <MotivationStep />;
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



  return (
    <div className="font-sans">
      {renderCurrentStep()}
    </div>
  );
};

export default PsychAILanding;