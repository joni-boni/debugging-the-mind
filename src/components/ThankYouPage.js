import React from 'react';

const ThankYouPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Vielen Dank!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Deine Antworten wurden erfolgreich gespeichert. Du bist jetzt auf unserer Warteliste und wirst benachrichtigt, sobald wir bereit sind.
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Was passiert als Nächstes?
          </h3>
          <ul className="text-blue-700 space-y-2 text-left">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Wir analysieren deine Antworten für personalisierte Inhalte
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Du erhältst Updates per E-Mail über unseren Fortschritt
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Sobald verfügbar, bekommst du frühen Zugang zu unserer Plattform
            </li>
          </ul>
        </div>

        <div className="border-t pt-6">
          <p className="text-sm text-gray-500 mb-4">
            Falls du Fragen hast, kannst du uns jederzeit kontaktieren.
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="/"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Zur Startseite
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;