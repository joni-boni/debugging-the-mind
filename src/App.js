import React, { useState } from 'react';
import { ChevronRight, Brain, Shield, Users, Star, ArrowRight, CheckCircle } from 'lucide-react';

const PsychAILanding = () => {
  const [currentStep, setCurrentStep] = useState('landing');
  const [answers, setAnswers] = useState({});

  const updateAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = (stepName) => {
    setCurrentStep(stepName);
  };

  // Landing Component
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Ihre mentale Gesundheit
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              im Fokus
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Entdecken Sie MindGuard AI – Ihren persönlichen, modulbasierten psychologischen Assistenten für präventive Betreuung und mentales Wohlbefinden.
          </p>
          
          <button
            onClick={() => nextStep('age')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center mx-auto"
          >
            Jetzt starten
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="bg-blue-100 p-3 rounded-full w-fit mb-6">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Präventive Betreuung</h3>
            <p className="text-gray-600 leading-relaxed">
              Erkennen Sie frühzeitig Stresssignale und entwickeln Sie gesunde Bewältigungsstrategien, bevor Probleme entstehen.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="bg-purple-100 p-3 rounded-full w-fit mb-6">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">KI-gestützte Analyse</h3>
            <p className="text-gray-600 leading-relaxed">
              Modernste KI-Technologie analysiert Ihre Eingaben und bietet personalisierte Empfehlungen für Ihr Wohlbefinden.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="bg-green-100 p-3 rounded-full w-fit mb-6">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Modulbasiert</h3>
            <p className="text-gray-600 leading-relaxed">
              Wählen Sie aus verschiedenen Modulen: Stressmanagement, Achtsamkeit, Schlafoptimierung und vieles mehr.
            </p>
          </div>
        </div>
        
        {/* Social Proof */}
        <div className="mt-20 text-center">
          <p className="text-gray-500 mb-6">Bereits über 1.000 Beta-Nutzer vertrauen auf MindGuard AI</p>
          <div className="flex justify-center items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-gray-600 font-medium">4.8/5 Bewertung</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Age Selection Component
  const AgeStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full w-fit mx-auto mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wie alt sind Sie?</h2>
          <p className="text-gray-600">Dies hilft uns, passende Inhalte für Sie zu finden.</p>
        </div>
        
        <div className="space-y-3">
          {[
            { value: '18-25', label: '18-25 Jahre' },
            { value: '26-35', label: '26-35 Jahre' },
            { value: '36-45', label: '36-45 Jahre' },
            { value: '46-55', label: '46-55 Jahre' },
            { value: '56+', label: '56+ Jahre' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => {
                updateAnswer('age', option.value);
                nextStep('demographic');
              }}
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Demographic Component
  const DemographicStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full w-fit mx-auto mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Was beschreibt Sie am besten?</h2>
          <p className="text-gray-600">So können wir Ihnen relevantere Inhalte bieten.</p>
        </div>
        
        <div className="space-y-3">
          {[
            { value: 'student', label: 'Student/in' },
            { value: 'employee', label: 'Angestellte/r' },
            { value: 'manager', label: 'Führungskraft' },
            { value: 'selfemployed', label: 'Selbstständig' },
            { value: 'parent', label: 'Elternteil' },
            { value: 'retired', label: 'Rentner/in' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => {
                updateAnswer('demographic', option.value);
                nextStep('motivation');
              }}
              className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Motivation Component
  const MotivationStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full w-fit mx-auto mb-4">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Was möchten Sie erreichen?</h2>
          <p className="text-gray-600">Wählen Sie Ihre Hauptziele aus (mehrere möglich).</p>
        </div>
        
        <div className="space-y-3">
          {[
            { value: 'stress', label: 'Stress besser bewältigen' },
            { value: 'sleep', label: 'Schlafqualität verbessern' },
            { value: 'anxiety', label: 'Ängste reduzieren' },
            { value: 'focus', label: 'Konzentration steigern' },
            { value: 'mood', label: 'Stimmung stabilisieren' },
            { value: 'relationships', label: 'Beziehungen verbessern' },
            { value: 'prevention', label: 'Präventive Vorsorge' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => {
                const current = answers.motivation || [];
                const updated = current.includes(option.value)
                  ? current.filter(item => item !== option.value)
                  : [...current, option.value];
                updateAnswer('motivation', updated);
              }}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                (answers.motivation || []).includes(option.value)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                {option.label}
                {(answers.motivation || []).includes(option.value) && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
        
        <button
          onClick={() => nextStep('purchase')}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
        >
          Weiter zur Bestellung
        </button>
      </div>
    </div>
  );

  // Purchase Component
  const PurchaseStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-full w-fit mx-auto mb-4">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Perfekt!</h2>
          <p className="text-gray-600 mb-6">
            Basierend auf Ihren Angaben haben wir das ideale Paket für Sie zusammengestellt.
          </p>
        </div>
        
        {/* Package Details */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white mb-6">
          <h3 className="text-xl font-semibold mb-4">MindGuard AI Premium</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Personalisierte KI-Analyse
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              {answers.motivation?.length || 1} ausgewählte Module
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
        <div className="text-center mb-6">
          <div className="text-gray-500 line-through text-lg">€79</div>
          <div className="text-4xl font-bold text-gray-900 mb-2">€49</div>
          <div className="text-sm text-gray-600">Einmaliger Preis • 30 Tage Geld-zurück-Garantie</div>
        </div>
        
        <button
          onClick={() => nextStep('success')}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 mb-4"
        >
          Jetzt für €49 kaufen
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          Nach dem Kauf erhalten Sie Zugang zu Ihrer personalisierten MindGuard AI Plattform.
        </p>
      </div>
    </div>
  );

  // Success/Email Collection Component
  const SuccessStep = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
      if (email && email.includes('@')) {
        // Here you would typically send the email to your mailing list
        console.log('Email submitted:', email, 'Answers:', answers);
        setSubmitted(true);
      }
    };

    if (submitted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vielen Dank!</h2>
            <p className="text-gray-600 mb-6">
              Sie haben sich erfolgreich registriert. Wir werden Sie in Kürze über den Launch informieren!
            </p>
            <div className="text-sm text-gray-500">
              Halten Sie Ausschau nach unserer E-Mail mit weiteren Details.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aufgrund der hohen Nachfrage aktuell nur noch Wartelistenplätze</h2>
            <p className="text-gray-600">
              Wir befinden uns aktuell in der Beta-Phase und schalten daher nur Kunden aus unserer Warteliste frei. Geben Sie Ihre E-Mail-Adresse ein, um sich für die Warteliste und den Newsletter anzumelden.
            </p>
          </div>
          
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre.email@beispiel.de"
              className="w-full p-4 border-2 border-gray-200 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
            />
            
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Zugang erhalten
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Wir respektieren Ihre Privatsphäre und senden niemals Spam.
          </p>
        </div>
      </div>
    );
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'landing':
        return <LandingPage />;
      case 'age':
        return <AgeStep />;
      case 'demographic':
        return <DemographicStep />;
      case 'motivation':
        return <MotivationStep />;
      case 'purchase':
        return <PurchaseStep />;
      case 'success':
        return <SuccessStep />;
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