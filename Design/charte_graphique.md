# 🎨 Charte Graphique IADMA

## 🏷️ Identité de Marque

### Nom Complet
**Institut Africain du Digital et des Métiers d'Avenir**

### Acronyme
**IADMA**

### Baseline/Slogan
*"Transformez vos compétences, transformez votre avenir"*

---

## 🎨 Palette de Couleurs

### Couleurs Principales
```css
/* Bleu IADMA - Confiance et professionnalisme */
--primary-blue: #1E40AF;
--primary-blue-light: #3B82F6;
--primary-blue-dark: #1E3A8A;

/* Orange Afrique - Énergie et innovation */
--accent-orange: #F97316;
--accent-orange-light: #FB923C;
--accent-orange-dark: #EA580C;

/* Vert Succès - Croissance et réussite */
--success-green: #059669;
--success-green-light: #10B981;
--success-green-dark: #047857;
```

### Couleurs Neutres
```css
/* Textes et backgrounds */
--neutral-900: #111827;  /* Texte principal */
--neutral-700: #374151;  /* Texte secondaire */
--neutral-500: #6B7280;  /* Texte tertiaire */
--neutral-300: #D1D5DB;  /* Bordures */
--neutral-100: #F3F4F6;  /* Background clair */
--neutral-50: #F9FAFB;   /* Background très clair */
--white: #FFFFFF;
```

---

## 🔤 Typographie

### Police Principale (Titres)
**Poppins** - Moderne, lisible, internationale
- Poids : 400 (Regular), 600 (SemiBold), 700 (Bold)
- Usage : Titres, navigation, boutons

### Police Secondaire (Texte)
**Inter** - Optimisée pour la lecture écran
- Poids : 400 (Regular), 500 (Medium), 600 (SemiBold)
- Usage : Corps de texte, descriptions

### Hiérarchie Typographique
```css
/* Titres */
h1: Poppins 700, 2.5rem (40px)
h2: Poppins 600, 2rem (32px)
h3: Poppins 600, 1.5rem (24px)
h4: Poppins 600, 1.25rem (20px)

/* Corps de texte */
body: Inter 400, 1rem (16px)
small: Inter 400, 0.875rem (14px)
caption: Inter 400, 0.75rem (12px)
```

---

## 🎯 Logo et Symboles

### Concept Logo
- **Symbole** : Forme géométrique moderne représentant la croissance (flèche stylisée + livre ouvert)
- **Couleurs** : Bleu principal + Orange accent
- **Style** : Minimaliste, vectoriel, scalable

### Variations Logo
1. **Logo complet** : Symbole + Texte "IADMA" + Baseline
2. **Logo horizontal** : Symbole + "IADMA"
3. **Logo vertical** : Symbole au-dessus de "IADMA"
4. **Symbole seul** : Pour favicon, réseaux sociaux

### Iconographie
- Style : Line icons (contour)
- Épaisseur : 2px
- Coins : Arrondis (border-radius: 4px)
- Couleur : Bleu principal ou neutre selon contexte

---

## 📱 Principes UI/UX

### Design System
- **Espacement** : Multiples de 8px (8, 16, 24, 32, 48, 64px)
- **Border-radius** : 8px (éléments), 12px (cartes), 24px (boutons)
- **Ombres** : Subtiles, cohérentes avec Material Design

### Boutons
```css
/* Bouton Principal */
.btn-primary {
  background: var(--primary-blue);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font: Poppins 600;
}

/* Bouton Secondaire */
.btn-secondary {
  background: transparent;
  color: var(--primary-blue);
  border: 2px solid var(--primary-blue);
  padding: 10px 22px;
  border-radius: 8px;
}

/* Bouton Accent */
.btn-accent {
  background: var(--accent-orange);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
}
```

### Cartes et Composants
```css
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 24px;
}

.input {
  border: 2px solid var(--neutral-300);
  border-radius: 8px;
  padding: 12px 16px;
  font: Inter 400;
}
```

---

## 🌍 Adaptation Culturelle

### Éléments Africains
- **Motifs** : Patterns géométriques subtils inspirés de l'art africain
- **Couleurs** : Terre cuite, ocre en accents secondaires
- **Imagerie** : Photos authentiques de jeunes africains en formation/travail

### Accessibilité
- **Contraste** : Minimum WCAG AA (4.5:1)
- **Tailles** : Texte minimum 16px sur mobile
- **Navigation** : Compatible clavier et lecteurs d'écran

---

## 📐 Grille et Layout

### Breakpoints Responsive
```css
/* Mobile First */
mobile: 320px - 767px
tablet: 768px - 1023px
desktop: 1024px - 1439px
large: 1440px+
```

### Grille
- **Container max-width** : 1200px
- **Colonnes** : 12 colonnes flexibles
- **Gutters** : 24px (desktop), 16px (mobile)

---

## 🎬 Animation et Interactions

### Transitions
```css
/* Standard */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Hover Effects */
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
```

### Micro-interactions
- Boutons : Scale légère au clic (0.98)
- Cartes : Élévation au survol
- Formulaires : Focus states colorés
- Chargement : Spinners cohérents avec la marque
