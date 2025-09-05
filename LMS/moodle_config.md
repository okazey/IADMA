# 🎓 Configuration Moodle pour IADMA

## 📋 Spécifications Techniques

### Prérequis Serveur
- **PHP** : 7.4+ (recommandé 8.1)
- **Base de données** : MySQL 5.7+ ou PostgreSQL 10+
- **Serveur web** : Apache 2.4+ ou Nginx 1.16+
- **RAM** : Minimum 4GB (recommandé 8GB+)
- **Stockage** : 50GB+ SSD

### Installation Moodle
```bash
# Télécharger Moodle
wget https://download.moodle.org/stable401/moodle-4.1.tgz
tar -xzf moodle-4.1.tgz
mv moodle /var/www/html/lms

# Créer répertoire de données
mkdir /var/moodledata
chmod 755 /var/moodledata
chown www-data:www-data /var/moodledata

# Configuration base de données
mysql -u root -p
CREATE DATABASE iadma_moodle;
CREATE USER 'moodle_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON iadma_moodle.* TO 'moodle_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🎨 Personnalisation IADMA

### Thème Custom
```php
// config.php - Configuration Moodle
<?php
unset($CFG);
global $CFG;
$CFG = new stdClass();

$CFG->dbtype    = 'mysqli';
$CFG->dblibrary = 'native';
$CFG->dbhost    = 'localhost';
$CFG->dbname    = 'iadma_moodle';
$CFG->dbuser    = 'moodle_user';
$CFG->dbpass    = 'secure_password';
$CFG->prefix    = 'mdl_';

$CFG->wwwroot   = 'https://lms.iadma.com';
$CFG->dataroot  = '/var/moodledata';
$CFG->admin     = 'admin';

$CFG->directorypermissions = 0777;

// Personnalisation IADMA
$CFG->theme = 'iadma_theme';
$CFG->lang = 'fr';
$CFG->timezone = 'Africa/Dakar';

// Sécurité
$CFG->passwordsaltmain = 'random_salt_here';

require_once(__DIR__ . '/lib/setup.php');
```

### Structure des Cours
```
IADMA Moodle Structure:
├── Catégorie: Compétences Digitales
│   └── Cours: Compétences digitales de base
├── Catégorie: Développement
│   └── Cours: Développement web & mobile
├── Catégorie: Entrepreneuriat
│   └── Cours: Entrepreneuriat & création d'entreprise
├── Catégorie: Marketing Digital
├── Catégorie: Cybersécurité
└── Catégorie: Soft Skills
```

---

## 🔧 Plugins Essentiels

### Plugins d'Authentification
- **OAuth2** : Connexion avec Google/Facebook
- **LDAP** : Intégration annuaire d'entreprise
- **Manual** : Inscription manuelle

### Plugins de Paiement
- **PayPal** : Paiements internationaux
- **Stripe** : Cartes bancaires
- **Custom Wave** : Paiements Wave (Afrique)

### Plugins Pédagogiques
- **H5P** : Contenu interactif
- **BigBlueButton** : Webinaires intégrés
- **Certificate** : Génération certificats
- **Progress Bar** : Suivi progression
- **Mobile App** : Application mobile

---

## 📱 Configuration Mobile

### Responsive Design
```css
/* Custom CSS pour mobile */
@media (max-width: 768px) {
    .course-content .section {
        padding: 10px;
    }
    
    .activity-item {
        font-size: 14px;
        padding: 8px;
    }
    
    .btn {
        min-height: 44px; /* Touch-friendly */
    }
}
```

### Application Mobile
- **Moodle Mobile App** personnalisée
- **Push notifications** pour nouveaux contenus
- **Téléchargement offline** des vidéos
- **Synchronisation** automatique

---

## 🎓 Structure Pédagogique

### Format des Cours
```
Cours Type: Compétences Digitales de Base
├── Semaine 1: Introduction
│   ├── Vidéo: Présentation (15 min)
│   ├── PDF: Support de cours
│   ├── Quiz: Évaluation initiale
│   └── Forum: Questions/Réponses
├── Semaine 2: Bureautique
│   ├── Vidéo: Word/Excel (20 min)
│   ├── Exercice: Créer un CV
│   ├── Vidéo: PowerPoint (15 min)
│   └── Projet: Présentation entreprise
└── Évaluation Finale
    ├── Quiz: 20 questions
    ├── Projet: Portfolio numérique
    └── Certificat: Génération automatique
```

### Paramètres d'Évaluation
- **Quiz** : 40% de la note finale
- **Projets pratiques** : 40% de la note finale
- **Participation forums** : 20% de la note finale
- **Seuil de réussite** : 70%

---

## 🔐 Sécurité et Sauvegarde

### Mesures de Sécurité
```php
// Sécurité renforcée
$CFG->forcelogin = true;
$CFG->forceloginforprofiles = true;
$CFG->opentogoogle = false;
$CFG->protectusernames = true;

// HTTPS obligatoire
$CFG->wwwroot = 'https://lms.iadma.com';
$CFG->cookiesecure = true;

// Limitations
$CFG->maxbytes = 100 * 1024 * 1024; // 100MB max upload
$CFG->sessiontimeout = 7200; // 2h session
```

### Sauvegarde Automatique
```bash
#!/bin/bash
# Script de sauvegarde quotidienne

# Variables
BACKUP_DIR="/backups/moodle"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="iadma_moodle"
MOODLE_DIR="/var/www/html/lms"
DATA_DIR="/var/moodledata"

# Créer répertoire de sauvegarde
mkdir -p $BACKUP_DIR/$DATE

# Sauvegarde base de données
mysqldump -u moodle_user -p$DB_PASS $DB_NAME > $BACKUP_DIR/$DATE/database.sql

# Sauvegarde fichiers Moodle
tar -czf $BACKUP_DIR/$DATE/moodle_files.tar.gz $MOODLE_DIR

# Sauvegarde données utilisateurs
tar -czf $BACKUP_DIR/$DATE/moodle_data.tar.gz $DATA_DIR

# Nettoyage (garder 30 jours)
find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} \;
```

---

## 📊 Analytics et Reporting

### Tableaux de Bord
- **Inscriptions** par formation
- **Taux de complétion** par cours
- **Temps passé** par étudiant
- **Notes moyennes** par module
- **Satisfaction** étudiants

### Intégration Google Analytics
```javascript
// Code de suivi personnalisé
gtag('config', 'GA_MEASUREMENT_ID', {
    custom_map: {
        'custom_parameter_1': 'course_name',
        'custom_parameter_2': 'user_type'
    }
});

// Tracking événements Moodle
function trackMoodleEvent(action, course, module) {
    gtag('event', action, {
        'event_category': 'Moodle',
        'event_label': course,
        'custom_parameter_1': course,
        'custom_parameter_2': 'student'
    });
}
```

---

## 🌍 Localisation Africaine

### Langues Supportées
- **Français** (principal)
- **Anglais** (secondaire)
- **Wolof** (Sénégal)
- **Bambara** (Mali)

### Adaptations Culturelles
- **Exemples locaux** dans les cours
- **Monnaies locales** (FCFA)
- **Fuseaux horaires** africains
- **Jours fériés** locaux dans le calendrier

### Optimisation Connexion
- **Compression** des vidéos
- **CDN** avec serveurs africains
- **Mode offline** pour zones rurales
- **Version allégée** pour connexions lentes
