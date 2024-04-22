const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const multer = require('multer');
const mammoth = require('mammoth');
const upload = multer({ storage: multer.memoryStorage() });
// Charger les variables d'environnement
require('dotenv').config();
// Utiliser les variables d'environnement pour accéder au mot de passe de la base de données
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const PORT = process.env.PORT;

// Autoriser toutes les requêtes CORS
app.use(cors());
// Middleware pour parser les données JSON
app.use(bodyParser.json());

// Connexion à MongoDB Atlas
const MONGODB_URI = `mongodb+srv://${dbUsername}:${dbPassword}@fury.gdvwmrw.mongodb.net/`;
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

// Définition du schéma MongoDB
const cvSchema = new mongoose.Schema({
  sections: [{
    section: String,
    content: String
  }]
});
const CV = mongoose.model('CV', cvSchema);

// Route pour télécharger le CV
app.post('/upload-cv', upload.single('cv'), async (req, res) => {
   // Vérification que le fichier est bien reçu
   console.log(`req.file : `,req.file);
   if (!req.file) {
    return res.status(400).send('No file uploaded.');
}
  try {
const result = await mammoth.extractRawText({ buffer: req.file.buffer });
console.log(result.value);
    const sections = extractSections(result.value);
    await saveSectionsToMongoDB(sections); // Attendre la sauvegarde des sections
    
    // Une fois que les sections ont été extraites et sauvegardées, vous pouvez supprimer le fichier de la mémoire
    delete req.file.buffer;
    res.send({ message: 'CV data extracted and saved successfully' });
  } catch (error) {
    console.error('Failed to upload CV:', error);
    res.status(500).send({ error: 'Failed to upload CV' });
  }
});

// Fonction pour extraire les sections du CV
function extractSections(cvText) {
     const sections = [];
  
  // Expression régulière pour extraire les données
  const regexes = {
    name: /(\bNom\b|\bPrénom\b):\s*([^\n]+)/i,
    cvTitle: /(\bTitre\b\s*(du\s*CV)?|Objectif):\s*([^\n]+)/i,
    skills: /(\bCompétences\b|\bSkills\b):\s*([^\n]+)/i,
    softSkills: /(\bSoft\s*Skills\b):\s*([^\n]+)/i,
    education: /(\DIPLOME\b|\bEducation\b|\bFormation\b):\s*([^\n]+)/i,
    experience: /(\bExpérience\s*professionnelle\b|\bExperience\b):\s*([\s\S]+?)(?=(\b\w+\b\s*:|$))/gi,
    certification: /(\bCertifications\b|\bCertification\b):\s*([^\n]+)/i
  };

  // Recherche de correspondances pour chaque section
  Object.entries(regexes).forEach(([sectionName, regex]) => {
      const match = cvText.match(regex);
      if (match) {
          const section = {
              section: sectionName,
              content: match[2] ? match[2].trim() : '' // Vérifie si match[2] est défini avant d'appeler trim()
          };
          sections.push(section);
      }
  });

  return sections;
}

// Fonction pour sauvegarder les sections extraites dans MongoDB
async function saveSectionsToMongoDB(sections) {
 try {
        // Crée un nouveau document CV
        const cv = new CV();

        // Parcours chaque section et stocke-la dans le document CV
        sections.forEach(section => {
          cv.sections.push({
            section: section.section,
            content: section.content
        });
        console.log(`Section: ${section.section}`);
        console.log(`Contenu: ${section.content}`);
        console.log('\n'); // Pour une séparation visuelle entre les sections
        });

        // Sauvegarde le document CV dans la base de données MongoDB
        await cv.save();
  } catch (error) {
      console.error('Failed to save CV sections to MongoDB:', error);
      throw new Error('Failed to save CV sections to MongoDB');
  }
}

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