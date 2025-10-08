import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PsychAILanding from './App_Modular_Clean';
import AdminPanelWrapper from './components/AdminPanelWrapper';
import ThankYouPage from './components/ThankYouPage';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Hauptanwendung */}
        <Route path="/" element={<PsychAILanding />} />
        
        {/* Dankesseite */}
        <Route path="/danke" element={<ThankYouPage />} />
        
        {/* Admin Panel */}
        <Route path="/admin-panel" element={<AdminPanelWrapper />} />
        
        {/* Redirect für alte Admin-Links */}
        <Route path="/admin" element={<Navigate to="/admin-panel" replace />} />
        
        {/* 404 - Fallback zur Hauptseite */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;