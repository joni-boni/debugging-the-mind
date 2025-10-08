import React, { useState } from 'react';
import { ChevronRight, Brain, Shield, Users, Star, ArrowRight, CheckCircle, Heart, Book, BarChart3 } from 'lucide-react';
import WordPressBlogDemo from './components/WordPressBlogDemo';
import SurveyAdminDashboard from './components/SurveyAdminDashboard';
import { 
  SurveyContainer, 
  SingleChoiceQuestion, 
  MultipleChoiceQuestion, 
  EmailInputQuestion, 
  StaticPageQuestion 
} from './components/SurveyComponents';
import { SURVEY_CONFIG, getSurveyStep, formatAnswersForWordPress } from './config/surveyConfig';
import wordPressSurveyService from './services/wordPressSurveyService';

const PsychAILanding = () => {
  const [currentStep, setCurrentStep] = useState('landing');
  const [answers, setAnswers] = useState({});
  const [showBlog, setShowBlog] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = (stepName) => {
    setCurrentStep(stepName);
  };

  const prevStep = () => {
    const stepOrder = ['landing', 'age', 'demographic', 'pets', 'tests', 'motivation', 'purchase', 'success'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const surveyData = formatAnswersForWordPress({ ...answers, email });
      console.log('Survey Results:', surveyData);
      
      // WordPress API Integration
      await wordPressSurveyService.submitSurveyResponse(surveyData);
      
      // Optional: Auch Newsletter-Anmeldung
      try {
        await wordPressSurveyService.subscribeToNewsletter(email, answers);
      } catch (newsletterError) {
        console.warn('Newsletter subscription failed:', newsletterError);
        // Newsletter failure shouldn't block the main flow
      }
      
      setCurrentStep('thankyou');
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Entschuldigung, es gab einen Fehler beim Speichern. Die Daten wurden lokal gesichert und werden später synchronisiert.');
      
      // Still proceed to thank you page even if save failed
      setCurrentStep('thankyou');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Global Admin Navigation Component - jetzt als fixe Position
  const GlobalAdminNav = () => (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setShowAdmin(true)}
        className="flex items-center bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 text-sm"
      >
        <BarChart3 className="w-4 h-4 mr-1" />
        Admin
      </button>
    </div>
  );

  // Enhanced Landing Component mit modularen Komponenten
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="absolute top-0 right-0 p-6 flex space-x-3">
        <button
          onClick={() => setShowBlog(true)}
          className="flex items-center bg-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 hover:text-blue-600"
        >
          <Book className="w-4 h-4 mr-2" />
          Blog
        </button>
        <button
          onClick={() => setShowAdmin(true)}
          className="flex items-center bg-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 hover:text-green-600"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Admin
        </button>
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
      <GlobalAdminNav />
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
          onNext={() => nextStep('demographic')}
          onBack={() => nextStep('landing')}
        />
      </SurveyContainer>
    </div>
  );

  // Demographic mit modularen Komponenten
  const DemographicStep = () => (
    <div>
      <GlobalAdminNav />
      <SurveyContainer currentStep={3} totalSteps={8}>
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
          selectedValue={answers.demographic}
          onSelect={(value) => updateAnswer('demographic', value)}
          onNext={() => nextStep('pets')}
          onBack={prevStep}
        />
      </SurveyContainer>
    </div>
  );

  // Pets mit modularen Komponenten
  const PetsStep = () => (
    <div>
      <GlobalAdminNav />
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
      <GlobalAdminNav />
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
      <GlobalAdminNav />
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
      <GlobalAdminNav />
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
      <GlobalAdminNav />
      <SurveyContainer currentStep={8} totalSteps={8}>
        <EmailInputQuestion
          title="Aufgrund der hohen Nachfrage nur noch Wartelistenplätze 📧"
          subtitle="Wir befinden uns aktuell in der Beta-Phase. Geben Sie Ihre E-Mail-Adresse ein, um sich für die Warteliste und Newsletter anzumelden."
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleFinalSubmit}
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
      <GlobalAdminNav />
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
              <button
                onClick={() => setShowBlog(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Zum Blog →
              </button>
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
      case 'demographic':
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

  // Admin Dashboard Toggle
  if (showAdmin) {
    return (
      <div className="font-sans">
        <button
          onClick={() => setShowAdmin(false)}
          className="fixed top-4 left-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
        >
          ← Zurück zur App
        </button>
        <SurveyAdminDashboard />
      </div>
    );
  }

  // Blog Toggle
  if (showBlog) {
    return (
      <div className="font-sans">
        <button
          onClick={() => setShowBlog(false)}
          className="fixed top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          ← Zurück zur App
        </button>
        <WordPressBlogDemo />
      </div>
    );
  }

  return (
    <div className="font-sans">
      {renderCurrentStep()}
    </div>
  );
};

export default PsychAILanding;