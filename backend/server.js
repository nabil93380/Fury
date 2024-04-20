const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 5000;
const username = 'olajuwon';
const password = encodeURIComponent('\"h$_vfMV10');

// Autoriser toutes les requêtes CORS
app.use(cors());
// Middleware pour parser les données JSON
app.use(bodyParser.json());

// Connexion à MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://olajuwon:admin@fury.gdvwmrw.mongodb.net/';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB :', err));

// Modèle de schéma pour les données du formulaire
const FormSchema = new mongoose.Schema({
  password: String,
  pseudo: String
});
const User = mongoose.model('User', FormSchema);
const Form = mongoose.model('Form', FormSchema);

// Route pour inscrire un nouvel utilisateur
app.post('/register', async (req, res) => {
    try {
    
      const { pseudo, password } = req.body;
  
      // Vérifie si le nom d'utilisateur ou l'adresse e-mail est déjà enregistré
    const existingUser = await User.findOne({
      $or: [
        { pseudo: req.body.pseudo },
        { password: req.body.password }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Nom d\'utilisateur ou adresse e-mail déjà utilisé.' });
    }

      // Créer un nouvel utilisateur dans la base de données
      const newUser = new User({ pseudo, password });
      await newUser.save();
	  console.log('Utilisateur créé avec succès');
  
      res.status(201).json({ message: 'Utilisateur créé avec succès !' });
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur :', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur.' });
    }
  });

// Route pour soumettre le formulaire
app.post('/submit-form', async (req, res) => {
  try {
    const { pseudo, password } = req.body;
	
	// Vérifie si le nom d'utilisateur ou l'adresse e-mail est déjà enregistré
    const existingUser = await User.findOne({
      $or: [
        { pseudo: req.body.pseudo },
        { password: req.body.password }
      ]
    });
	
	// Si l'utilisateur n'existe pas, retourne un message d'erreur
    if (!existingUser) {
      return res.status(400).json({ message: 'Nom d\'utilisateur incorrect.' });
    }
	
	// Vérifie si le mot de passe correspond à celui enregistré en base de données
    if (existingUser.password !== password) {
      return res.status(400).json({ message: 'Mot de passe incorrect.' });
    }
	// Si tout est OK, retourne un message de succès
    res.status(201).json({ message: 'Formulaire soumis avec succès !' });
  } catch (err) {
    console.error('Erreur lors de la soumission du formulaire :', err);
    res.status(500).json({ message: 'Erreur lors de la soumission du formulaire.' });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});