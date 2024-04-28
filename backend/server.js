const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const { spawn } = require('child_process');
const multer = require('multer');
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
const CvModel = mongoose.model('cv', cvSchema);

// Route pour télécharger le CV
app.post('/upload-cv', upload.single('cv'), (req, res) => {

  // Vérification que le fichier est bien reçu
  console.log(`req.file : `,req.file);
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
}
  // Récupérer les données du fichier depuis req.file.buffer
  const cvBuffer = req.file.buffer;
  // Exécuter un script Python pour traiter le fichier Word
  const pythonProcess = spawn('python', ['C:\\Users\\Nabil\\Documents\\ScriptPython\\regex.py', cvBuffer]);
  // Stocker les sections extraites du CV
  let cvSections = {};
  // Gérer la sortie du script Python
  pythonProcess.stdout.on('data', (data) => {
        // Traiter les données renvoyées par le script Python
        try {
          cvSections = JSON.parse(data);
          console.log(cvSections);
      } catch (error) {
          console.error('Erreur lors de la conversion des données JSON :', error);
          return res.status(500).send('Internal Server Error');
      }
      });
      // Gérer les erreurs éventuelles
    pythonProcess.stderr.on('data', (data) => {
      // Afficher les erreurs éventuelles
      console.error(`Erreur dans le script Python : ${data}`);
  });

  pythonProcess.on('close', async(code) => {
    console.log(`Le script Python s'est terminé avec le code ${code}`);

    // Vérifier que les sections du CV ont été correctement extraites
    if (Object.keys(cvSections).length === 0) {
      console.error('Aucune section n\'a été extraite du CV');
      return res.status(500).send('Internal Server Error');
  }
    
      try {
        // Enregistrer les sections extraites dans la base de données avec Mongoose
        const newCv = new CvModel();

              // Parcours chaque section et stocke-la dans le document CV
              Object.entries(cvSections).forEach(([sectionName, sectionContent]) => {
                const content = Array.isArray(sectionContent) ? sectionContent.join('\n') : String(sectionContent);
                newCv.sections.push({
                  section: sectionName,
                  content: content
                });
                console.log(`Section: ${sectionName}`);
                console.log(`Contenu: ${sectionContent}`);
                console.log('\n'); // Pour une séparation visuelle entre les sections
              });

        await newCv.save();
        console.log('Sections du CV enregistrées dans MongoDB');
        // Répondre à la requête HTTP avec un message de succès
        res.send('Traitement du CV terminé et sections enregistrées dans MongoDB');
      } catch (err) {
        console.error('Erreur lors de l\'insertion des données :', err);
        return res.status(500).send('Internal Server Error');
      }
  });
});

// Fonction pour extraire les sections du CV
/*function extractSections(cvText) {
     const sections = [];
  
  // Expression régulière pour extraire les données
  const regexes = {
    name: /(\bName\b|\bNom\b|\bPrénom\b):\s*([^\n]+)/i,
    education: /(?:ETUDES ET FORMATIONS|EDUCATION ET FORMATION|EDUCATION):\s*([\s\S]+?)(?=\bCOMPETENCES\b|\bLANGUES\b|\bEXPERIENCE\b|\z)/i,
    technicalSkills: /(?:COMPETENCES TECHNIQUES|TECHNICAL SKILLS|COMPETENCES TECHNIQUES ET FONCTIONNELLES):\s*([\s\S]+?)(?=\bCOMPETENCES\b|\bLANGUES\b|\bEXPERIENCE\b|\z)/i,
    functionalSkills: /(?:COMPETENCES FONCTIONNELLES|FONCTIONAL SKILLS|COMPETENCES FONCTIONNELLES ET TECHNIQUES):\s*([\s\S]+?)(?=\bCOMPETENCES\b|\bLANGUES\b|\bEXPERIENCE\b|\z)/i,
    experience: /(?:EXPERIENCE PROFESSIONNELLE|PROFESSIONAL EXPERIENCE|EXPERIENCE):\s*([\s\S]+?)(?=\bCOMPETENCES\b|\bLANGUES\b|\bETUDES\b|\z)/i,
    languages: /(?:LANGUES|LANGUAGE):\s*([\s\S]+?)(?=\bEXPERIENCE\b|\z)/i

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
        const cv = new CvModel();

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
}*/

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