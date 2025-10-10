import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

// Base Container für alle Survey Steps
export const SurveyContainer = ({ children, currentStep, totalSteps }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500">Fortschritt</span>
          <span className="text-sm font-medium text-gray-500">{currentStep}/{totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
      {children}
    </div>
  </div>
);

// Single Choice Component (für Alter, Demographics)
export const SingleChoiceQuestion = ({ 
  title, 
  subtitle, 
  options, 
  selectedValue, 
  onSelect, 
  onNext, 
  onBack, 
  showBack = true,
  nextButtonText = "Weiter"
}) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
    {subtitle && <p className="text-gray-600 mb-8">{subtitle}</p>}
    
    <div className="space-y-3 mb-8">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
            selectedValue === option.value
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center">
            {option.icon && (
              <div className="mr-3 flex-shrink-0">
                {React.createElement(option.icon, { 
                  className: `w-5 h-5 ${selectedValue === option.value ? 'text-blue-600' : 'text-gray-500'}` 
                })}
              </div>
            )}
            <div className="flex-1">
              <div className="font-semibold">{option.label}</div>
              {option.description && (
                <div className="text-sm text-gray-500 mt-1">{option.description}</div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>

    <div className="flex justify-between">
      {showBack && (
        <button
          onClick={onBack}
          className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </button>
      )}
      <button
        onClick={onNext}
        disabled={!selectedValue}
        className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all ${
          selectedValue
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        } ${!showBack ? 'ml-auto' : ''}`}
      >
        {nextButtonText}
        <ArrowRight className="ml-2 h-4 w-4" />
      </button>
    </div>
  </div>
);

// Multiple Choice Component (für Pets, Motivation Goals)
export const MultipleChoiceQuestion = ({ 
  title, 
  subtitle, 
  options, 
  selectedValues = [], 
  onToggle, 
  onNext, 
  onBack,
  showBack = true,
  nextButtonText = "Weiter",
  minSelections = 0,
  maxSelections = null,
  exclusiveOptions = [] // Array von option values die andere ausschließen
}) => {
  const isExclusiveSelected = exclusiveOptions.some(option => selectedValues.includes(option));
  const canSelectMore = maxSelections ? selectedValues.length < maxSelections : true;
  const hasMinimumSelections = selectedValues.length >= minSelections;

  const handleToggle = (value) => {
    // Wenn eine exklusive Option gewählt wird, deselektiere alle anderen
    if (exclusiveOptions.includes(value)) {
      if (selectedValues.includes(value)) {
        onToggle([]); // Deselektiere alles
      } else {
        onToggle([value]); // Nur diese Option
      }
      return;
    }

    // Wenn eine exklusive Option bereits gewählt ist, ersetze sie
    if (isExclusiveSelected) {
      onToggle([value]);
      return;
    }

    // Normale Multiple Choice Logik
    if (selectedValues.includes(value)) {
      onToggle(selectedValues.filter(v => v !== value));
    } else if (canSelectMore) {
      onToggle([...selectedValues, value]);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
      {subtitle && <p className="text-gray-600 mb-8">{subtitle}</p>}
      
      <div className="space-y-3 mb-8">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          const isDisabled = !isSelected && !canSelectMore && !isExclusiveSelected;
          
          return (
            <button
              key={option.value}
              onClick={() => handleToggle(option.value)}
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
                {option.icon && (
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
                )}
                <div className="flex-1">
                  <div className="font-semibold">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {maxSelections && (
        <p className="text-sm text-gray-500 mb-4">
          {selectedValues.length}/{maxSelections} ausgewählt
        </p>
      )}

      <div className="flex justify-between">
        {showBack && (
          <button
            onClick={onBack}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!hasMinimumSelections}
          className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all ${
            hasMinimumSelections
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } ${!showBack ? 'ml-auto' : ''}`}
        >
          {nextButtonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Email Input Component - Komplett isolierter State
export const EmailInputQuestion = ({ 
  title, 
  subtitle, 
  initialEmail = '',
  onSubmit, 
  onBack,
  showBack = true,
  submitButtonText = "Absenden",
  isSubmitting = false,
  showCheckboxes = false
}) => {
  const [email, setEmail] = React.useState(initialEmail);
  const [showValidation, setShowValidation] = React.useState(false);
  const [hasBlurred, setHasBlurred] = React.useState(false);
  const [newsletter, setNewsletter] = React.useState(false);
  const [interview, setInterview] = React.useState(false);
  
  const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const shouldShowError = (showValidation || hasBlurred) && email && !isValidEmail;

  const handleEmailChange = (value) => {
    setEmail(value);
  };

  const handleBlur = () => {
    setHasBlurred(true);
    setShowValidation(true);
  };

  const handleSubmit = () => {
    setShowValidation(true);
    if (isValidEmail) {
      onSubmit(email, { newsletter, interview }); // Pass email and checkbox values to parent
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
      {subtitle && <p className="text-gray-600 mb-8">{subtitle}</p>}
      
      <div className="mb-8">
        <input
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="deine@email.com"
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg"
          autoComplete="email"
        />
        {shouldShowError && (
          <p className="text-red-500 text-sm mt-2">Bitte gib eine gültige E-Mail-Adresse ein</p>
        )}
        
        {showCheckboxes && (
          <div className="mt-6 space-y-4">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className="mr-3 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                📧 Newsletter für die App - Ich möchte über Updates und den Launch informiert werden
              </span>
            </label>
            
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={interview}
                onChange={(e) => setInterview(e.target.checked)}
                className="mr-3 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                💬 Man darf mich für ein Interview kontaktieren um den Entwicklungsprozess aktiv mitzugestalten
              </span>
            </label>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        {showBack && (
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all ${
            isValidEmail && !isSubmitting
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } ${!showBack ? 'ml-auto' : ''}`}
        >
          {isSubmitting ? 'Wird gesendet...' : submitButtonText}
          {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

// Static Page Component (für Landing, Tests, Purchase)
export const StaticPageQuestion = ({ 
  title, 
  subtitle, 
  content, 
  onNext, 
  onBack,
  showBack = false,
  nextButtonText = "Weiter",
  customButton = null
}) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
    {subtitle && <p className="text-gray-600 mb-8">{subtitle}</p>}
    
    <div className="mb-8">
      {content}
    </div>

    <div className="flex justify-between">
      {showBack && (
        <button
          onClick={onBack}
          className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </button>
      )}
      
      {customButton || (
        <button
          onClick={onNext}
          className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl ${!showBack ? 'ml-auto' : ''}`}
        >
          {nextButtonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      )}
    </div>
  </div>
);

// Slider Question Component
export const SliderQuestion = ({
  title,
  subtitle,
  min = 1,
  max = 10,
  value,
  onChange,
  onNext,
  onBack,
  showBack = true,
  nextButtonText = "Weiter",
  leftLabel = "",
  rightLabel = ""
}) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
    {subtitle && <p className="text-gray-600 mb-8">{subtitle}</p>}
    
    <div className="mb-8">
      {/* Current Value Display */}
      <div className="text-center mb-6">
        <div className="inline-block bg-blue-100 px-6 py-3 rounded-full">
          <span className="text-2xl font-bold text-blue-600">{value}</span>
        </div>
      </div>
      
      {/* Slider */}
      <div className="relative mb-4 py-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
          }}
        />
        
        {/* Custom Slider Styles */}
        <style jsx>{`
          .slider {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            outline: none;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
          
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.2s ease;
            position: relative;
            z-index: 10;
          }
          
          .slider::-webkit-slider-thumb:hover,
          .slider::-webkit-slider-thumb:active {
            transform: scale(1.2);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          }
          
          .slider::-moz-range-thumb {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.2s ease;
            -moz-appearance: none;
            appearance: none;
          }
          
          .slider::-moz-range-thumb:hover,
          .slider::-moz-range-thumb:active {
            transform: scale(1.2);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          }
          
          .slider::-webkit-slider-track {
            height: 12px;
            border-radius: 6px;
          }
          
          .slider::-moz-range-track {
            height: 12px;
            border-radius: 6px;
            background: transparent;
            border: none;
          }
          
          /* Touch-optimized styles for mobile */
          @media (pointer: coarse) {
            .slider::-webkit-slider-thumb {
              width: 40px;
              height: 40px;
            }
            
            .slider::-moz-range-thumb {
              width: 40px;
              height: 40px;
            }
          }
        `}</style>
      </div>
      
      {/* Labels */}
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-sm text-gray-500">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
      
      {/* Scale Numbers */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        {Array.from({ length: max - min + 1 }, (_, i) => (
          <span key={i}>{min + i}</span>
        ))}
      </div>
    </div>

    {/* Navigation Buttons */}
    <div className={`flex ${showBack ? 'justify-between' : 'justify-end'} items-center`}>
      {showBack && (
        <button
          onClick={onBack}
          className="flex items-center px-6 py-3 rounded-xl font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </button>
      )}
      
      <button
        onClick={onNext}
        className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl ${!showBack ? 'ml-auto' : ''}`}
      >
        {nextButtonText}
        <ArrowRight className="ml-2 h-4 w-4" />
      </button>
    </div>
  </div>
);