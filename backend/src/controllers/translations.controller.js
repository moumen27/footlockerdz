import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin absolu vers le dossier i18n du frontend
const I18N_PATH = path.resolve(__dirname, '../../../frontend/src/i18n');

// Obtenir toutes les traductions
export const getTranslations = (req, res) => {
  try {
    const languages = ['fr', 'ar'];
    const translations = {};

    languages.forEach((lng) => {
      translations[lng] = {};
      const lngPath = path.join(I18N_PATH, lng);
      
      if (fs.existsSync(lngPath)) {
        const files = fs.readdirSync(lngPath).filter(file => file.endsWith('.json'));
        
        files.forEach((file) => {
          const namespace = file.replace('.json', '');
          const content = fs.readFileSync(path.join(lngPath, file), 'utf-8');
          try {
            translations[lng][namespace] = content.trim() ? JSON.parse(content) : {};
          } catch (e) {
            translations[lng][namespace] = {};
            console.warn(`Could not parse JSON for ${lng}/${file}, treating as empty.`);
          }
        });
      }
    });

    res.json(translations);
  } catch (error) {
    console.error('Erreur lors de la lecture des traductions:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la lecture des traductions' });
  }
};

// Mettre à jour un fichier de traduction
export const updateTranslation = (req, res) => {
  try {
    const { lng, namespace, data } = req.body;

    if (!lng || !namespace || !data) {
      return res.status(400).json({ message: 'Paramètres manquants (lng, namespace, data)' });
    }

    const filePath = path.join(I18N_PATH, lng, `${namespace}.json`);

    // Vérifier si le dossier de langue existe, sinon le créer
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Écrire les données dans le fichier JSON
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    res.json({ message: `Traduction ${namespace} (${lng}) mise à jour avec succès` });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la traduction:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la sauvegarde' });
  }
};
