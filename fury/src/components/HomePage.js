
import React from 'react';
import '../styles/home.css';

function HomePage() {
  return (
    <div>
    <header>
      <h1>Bienvenue sur Votre Application RH</h1>
      <nav>
        <ul>
          <li><a href="/profil">Mon Profil</a></li>
          <li><a href="/tableau-de-bord">Tableau de Bord</a></li>
          <li><a href="/deconnexion">Déconnexion</a></li>
        </ul>
      </nav>
    </header>
    <main>
      <section className="presentation">
        <h2>Découvrez les fonctionnalités de notre application</h2>
        <p>Votre Application RH offre une suite complète d'outils pour la gestion efficace des ressources humaines.</p>
      </section>
      <section className="features">
        <div className="feature">
          <h3>Importation de CV</h3>
          <p>Importer les CV à enregistrer en base.</p>
        </div>
        <div className="feature">
          <h3>Tri et Classification de CV</h3>
          <p>Fournir à l'IA les CV à classer selon un Ordre de Mission.</p>
        </div>
        {/* Ajoutez d'autres fonctionnalités ici */}
      </section>
    </main>
    <footer>
      <p>&copy; 2024 Votre Entreprise - Tous droits réservés</p>
    </footer>
  </div>
  );
}

export default HomePage;