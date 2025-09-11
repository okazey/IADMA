# 🤖 Guide Gemini AI - Génération Voix Off IADMA

**Modèles recommandés**: 
- `gemini-2.5-flash-preview-tts` (économique, quotidien)
- `gemini-2.5-pro-preview-tts` (qualité supérieure, contrôle avancé)

---

## 🚀 CONFIGURATION INITIALE

### Prérequis
1. **Compte Google AI Studio** : [aistudio.google.com](https://aistudio.google.com/generate-speech)
2. **API Key Gemini** : Obtenir depuis Google AI Studio
3. **Test préalable** : Tester les voix dans AI Studio avant production

### Installation Python (optionnel)
```bash
pip install google-generativeai
```

---

## 🎙️ PROMPTS GEMINI POUR CHAQUE SECTION

### SECTION 1: ACCROCHE (0-15 secondes)
```
Parle avec une voix masculine africaine francophone, ton confiant et chaleureux, rythme modéré avec emphase dramatique sur "NÉCESSITÉ". Fais une pause de 2 secondes après "NÉCESSITÉ" puis reprends avec un ton inspirant :

"En 2024, maîtriser le numérique n'est plus un luxe... C'est une NÉCESSITÉ ! 

[PAUSE]

Et si je vous disais qu'en seulement 14 jours, vous pouvez transformer votre avenir professionnel ?"
```

### SECTION 2: PROBLÉMATIQUE (15-45 secondes)
```
Utilise un ton empathique et légèrement préoccupé pour les questions, puis change vers un ton optimiste et énergique pour la fin. Accent africain francophone naturel :

"Combien d'opportunités avez-vous manquées parce que vous ne maîtrisiez pas Word, Excel ou PowerPoint ? Combien de fois avez-vous évité de postuler à un emploi parce qu'il fallait 'maîtriser les outils informatiques' ? En Afrique, 70% des emplois exigent aujourd'hui des compétences numériques de base... Mais BONNE NOUVELLE ! Il n'est jamais trop tard pour rattraper le train du numérique !"
```

### SECTION 3: SOLUTION IADMA (45-90 secondes)
```
Parle avec enthousiasme et énergie, emphase sur "RÉVOLUTIONNAIRE" et "TOUTES". Rythme accéléré sur "100% x3" :

"Je vous présente la formation RÉVOLUTIONNAIRE de l'Institut Africain du Digital et des Métiers d'Avenir ! 14 jours pour maîtriser TOUTES les compétences digitales essentielles : Microsoft Office - Word, Excel, PowerPoint, Navigation Internet et recherche efficace, Messagerie professionnelle, Google Workspace et collaboration, Réseaux sociaux professionnels, Sécurité numérique. 100% en ligne, 100% pratique, 100% certifiant ! Nos formateurs experts vous accompagnent étape par étape, avec des vidéos, des exercices concrets et un support personnalisé."
```

### SECTION 4: TÉMOIGNAGES (90-120 secondes)
```
Crée 3 voix différentes - une jeune femme joyeuse, un homme mature satisfait, une étudiante confiante. Chaque témoignage doit sonner authentique et sincère :

Témoignage 1 (voix féminine jeune, joyeuse) : "Grâce à IADMA, j'ai décroché mon premier emploi en administration ! En 2 semaines, j'ai appris ce que j'aurais dû savoir depuis des années."

Témoignage 2 (voix masculine mature, satisfaite) : "Maintenant je gère mes factures sur Excel, mes présentations sur PowerPoint... Mon business a explosé !"

Témoignage 3 (voix féminine étudiante, confiante) : "Le certificat IADMA a fait la différence sur mon CV. Les recruteurs sont impressionnés !"
```

### SECTION 5: URGENCE ET OFFRE (120-150 secondes)
```
Ton urgent mais bienveillant, rythme accéléré vers la fin. Emphase sur les prix et l'urgence :

"ATTENTION ! Cette formation qui vaut normalement 50 000 FCFA... est disponible en PROMOTION EXCEPTIONNELLE à seulement 15 000 FCFA ! Soit moins de 500 FCFA par jour pour transformer votre vie ! Mais dépêchez-vous ! Plus que 48 heures pour profiter de cette offre limitée !"
```

### SECTION 6: BONUS (150-165 secondes)
```
Ton généreux et rassurant, liste les bonus avec un rythme régulier :

"Et ce n'est pas tout ! Vous recevez en BONUS : 50 templates professionnels, Guide PDF de 100 pages, Accès VIP au groupe LinkedIn Alumni, 3 mois de suivi post-formation. Plus notre GARANTIE 'Satisfait ou Remboursé' de 30 jours !"
```

### SECTION 7: APPEL À L'ACTION (165-180 secondes)
```
Ton motivant et décisif, emphase sur "MAINTENANT" et finale inspirante :

"Alors, êtes-vous prêt à rejoindre les milliers d'Africains qui ont déjà transformé leur avenir avec IADMA ? Cliquez MAINTENANT sur le lien en description ! Votre futur vous attend... Ne le laissez pas passer ! IADMA - Institut Africain du Digital et des Métiers d'Avenir. Votre succès commence ICI !"
```

---

## 🎯 VOIX RECOMMANDÉES GEMINI

### Voix Masculines
- **Charon** : Voix grave, autoritaire (pour sections urgence/CTA)
- **Fenrir** : Voix chaude, rassurante (pour sections explicatives)

### Voix Féminines  
- **Aoede** : Voix claire, professionnelle (pour présentation)
- **Puck** : Voix énergique, optimiste (pour accroche/motivation)

### Voix Neutres
- **Enceladus** : Voix douce, empathique (pour problématique)

---

## 💻 CODE PYTHON POUR GÉNÉRATION AUTOMATIQUE

```python
import google.generativeai as genai
import os

# Configuration
genai.configure(api_key="VOTRE_API_KEY")

def generer_voix_section(prompt_text, voice_name="Charon"):
    """Génère l'audio pour une section spécifique"""
    
    model = genai.GenerativeModel("gemini-2.5-pro-preview-tts")
    
    response = model.generate_content(
        prompt_text,
        generation_config=genai.GenerationConfig(
            response_modalities=["audio"],
            speech_config=genai.SpeechConfig(
                voice_config=genai.VoiceConfig(name=voice_name)
            )
        )
    )
    
    return response.candidates[0].content.parts[0].inline_data.data

# Exemple d'utilisation
sections = {
    "accroche": {
        "prompt": "Parle avec une voix masculine africaine francophone...",
        "voice": "Charon"
    },
    "problematique": {
        "prompt": "Utilise un ton empathique...",
        "voice": "Enceladus"
    }
    # ... autres sections
}

# Génération de tous les audios
for section_name, config in sections.items():
    audio_data = generer_voix_section(config["prompt"], config["voice"])
    
    # Sauvegarder le fichier audio
    with open(f"iadma_{section_name}.wav", "wb") as f:
        f.write(audio_data)
    
    print(f"✅ Section {section_name} générée")
```

---

## 🎛️ CONTRÔLES AVANCÉS GEMINI

### Contrôle du Rythme
```
"Parle lentement et distinctement : [texte]"
"Accélère le rythme pour créer de l'urgence : [texte]"
"Fais une pause de 2 secondes puis reprends : [texte]"
```

### Contrôle de l'Émotion
```
"Avec conviction et passion : [texte]"
"D'un ton rassurant et bienveillant : [texte]"  
"Avec urgence mais sans agressivité : [texte]"
```

### Contrôle de l'Accent
```
"Avec un accent africain francophone naturel : [texte]"
"Prononciation claire pour public international : [texte]"
```

---

## 📱 WORKFLOW COMPLET

### Étape 1: Test dans AI Studio
1. Aller sur [AI Studio](https://aistudio.google.com/generate-speech)
2. Tester chaque prompt avec différentes voix
3. Ajuster les prompts selon les résultats

### Étape 2: Génération par Sections
1. Utiliser le code Python ou l'interface web
2. Générer chaque section séparément
3. Télécharger les fichiers audio

### Étape 3: Post-Production
1. Assembler les sections dans un éditeur audio
2. Ajouter la musique de fond
3. Synchroniser avec les visuels

### Étape 4: Optimisation
1. Ajuster les niveaux audio
2. Égalisation pour cohérence
3. Export final haute qualité

---

## 🎯 PROMPTS OPTIMISÉS PAR PLATEFORME

### Version TikTok (30 sec)
```
Crée une voix énergique et accrocheuse, rythme rapide, accent africain francophone :

"En 2024, maîtriser le numérique c'est VITAL ! IADMA vous forme en 14 jours : Word, Excel, PowerPoint, tout ! 15 000 FCFA au lieu de 50 000 ! Plus que 48h ! Cliquez maintenant !"
```

### Version Instagram Stories (15 sec x 6)
```
Story 1 - Ton urgent : "Combien d'emplois ratés par manque de compétences digitales ?"
Story 2 - Ton solution : "IADMA forme en 14 jours aux outils essentiels !"
Story 3 - Ton détail : "Word, Excel, PowerPoint, Google, réseaux sociaux !"
Story 4 - Ton témoignage : "J'ai décroché mon emploi grâce à IADMA !"
Story 5 - Ton offre : "15 000 FCFA au lieu de 50 000 ! Offre limitée !"
Story 6 - Ton action : "Inscrivez-vous MAINTENANT ! Votre succès commence ici !"
```

---

## 💡 CONSEILS D'OPTIMISATION

### Qualité Audio
- Utiliser `gemini-2.5-pro-preview-tts` pour la version finale
- Générer en haute qualité (44.1 kHz minimum)
- Tester plusieurs voix pour chaque section

### Cohérence
- Garder la même voix principale tout au long
- Varier uniquement pour les témoignages
- Maintenir le même accent africain francophone

### Performance
- Diviser le script en sections pour meilleur contrôle
- Utiliser des prompts spécifiques pour chaque émotion
- Tester et itérer rapidement dans AI Studio

---

**🚀 Avec Gemini AI, créez une voix off professionnelle qui convertit et inspire vos prospects IADMA !**
