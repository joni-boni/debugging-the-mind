import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import SurveyAdminDashboard from './SurveyAdminDashboard';
import AdminLogin from './AdminLogin';

const AdminPanelWrapper = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Prüfe beim Laden, ob bereits authentifiziert
  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const handleLogin = (success) => {
    setIsAuthenticated(success);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

  // Zeige Login-Seite wenn nicht authentifiziert
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Zeige Admin-Dashboard wenn authentifiziert
  return (
    <div className="font-sans">
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-between">
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2 inline" />
          Zurück zur App
        </button>
        
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2 inline" />
          Abmelden
        </button>
      </div>
      
      <SurveyAdminDashboard />
    </div>
  );
};

export default AdminPanelWrapper;