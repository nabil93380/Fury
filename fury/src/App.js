import React from 'react';
import { BrowserRouter as Router, Routes,Route,Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';

function App() {
  return (
    <Router>
    <Routes>
      {/* Définition de la route pour la page de connexion */}
      {/* Redirection vers la page de connexion */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route exact path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      {/* Ajoute d'autres routes ici si nécessaire */}
    </Routes>
  </Router>
  );
}

export default App;