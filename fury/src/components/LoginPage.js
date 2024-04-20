import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
function LoginPage() {
  // Déclaration des états pour stocker le pseudo et le mot de passe
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  // Ajoutez un état pour suivre si l'utilisateur est en train de s'inscrire
  const [isRegistering, setIsRegistering] = useState(false); 
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Utilisation de useNavigate pour la navigation

  // Fonction de gestion du changement de l'email
  const handlePseudoChange = (e) => {
    setPseudo(e.target.value);
  };

  // Fonction de gestion du changement du mot de passe
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Fonction de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Cool');
    // Ici, tu peux ajouter la logique de connexion avec une API, une base de données, etc.

	  try {
		 
		  if (isRegistering) {
        // Code pour créer un nouvel utilisateur
		const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pseudo, password }),
      });
      if (response.ok) {
        console.log('Utilisateur créé avec succès !');
        // Redirigez l'utilisateur ou effectuez toute autre action nécessaire.
        navigate('/home');
      } else {
        console.error('Erreur lors de la création de l\'utilisateur.');
      }
      
        console.log('Créer un nouvel utilisateur');
      } else {
        // Code pour connecter l'utilisateur
		const response = await fetch('http://localhost:5000/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pseudo, password }),
      });
      // Logique de vérification des informations d'identification
      const data = await response.json();
      if(response.ok){
        // Rediriger vers la page d'accueil si le formulaire est soumis avec succès
        navigate('/home');
        console.log('Connecter l\'utilisateur');
      }else{
        // Afficher le message d'erreur renvoyé par le serveur
        setError(data.message);
      }
       
      }
    
    } catch (error) {
      console.error('Erreur lors de la requête :', error);
    }
    console.log('pseudo:', pseudo);
    console.log('Password:', password);
  };

  // Rendu du composant
  return (
    <div className="login-container">
    <h2>Connexion {isRegistering.valueOf.toString}</h2>
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="pseudo">Nom d'utilisateur :</label>
        <input type="text" id="pseudo" name="pseudo" value={pseudo} onChange={handlePseudoChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="password">Mot de passe :</label>
        <input type="password" id="password" name="password" value={password} onChange={handlePasswordChange} required />
      </div>
      <div className="form-group">
        <input type="submit" value="Se connecter" />
      </div>
	  <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="form-group register-link">
        {isRegistering ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? S\'inscrire'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  </div>
  );
}

export default LoginPage;