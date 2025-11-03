# KarbonFix — Animation Parfum (Style A)

Ce kit crée un point de départ exécutable pour produire l’animation verticale 1080x1920 avec reveal morph (fumée → logo 3D).

## Structure
- scripts/blender/karbonfix_logo_setup.py — génère un logo 3D réaliste (Chrome noir + Verre bleu) et une scène prête à rendre (Cycles).
- scripts/aftereffects/karbonfix_setup.jsx — prépare un projet AE: comp 1080x1920, marqueurs, placeholders pour fumée/morph et lockup final.
- storyboard/storyboard.md — déroulé 12–15 s avec timecodes.
- brand/brand.json — paramètres de marque (bleu provisoire #2F80FF, fps=30, style=A).
- assets/ (placez votre `karbonfix.svg` ici si disponible).

## Rapide démarrage — Blender (logo 3D)
1. Ouvrir Blender ≥ 3.5.
2. File → New → General.
3. Scripting → ouvrir `scripts/blender/karbonfix_logo_setup.py`.
4. Facultatif: placez un SVG propre dans `assets/brand/karbonfix.svg` (formes fermées, un calque par élément: Karbon / F / i / X / contour).
5. Exécuter le script (Run). Il crée:
   - Texte de fallback “Karbon” + “Fix” si pas de SVG.
   - Matériaux Style A (chrome noir, verre bleu avec légère émission).
   - Eclairage studio simple + caméra verticale 1080x1920.
   - Rendu test dans `renders/logo3d_still.png`.

## Rapide démarrage — After Effects (morph)
1. Ouvrir After Effects (2021+).
2. File → Scripts → Run Script File… → `scripts/aftereffects/karbonfix_setup.jsx`.
3. Le script crée un projet avec comp `KF_Main_1080x1920_30fps_15s` et des placeholders:
   - `SMOKE_Particles` (pour Trapcode Particular/Stardust).
   - `MORPH_Guide_Paths` (collez vos masks depuis un SVG → convertissez dans AI en tracés).
   - `LOGO_3D_PNG` (importez votre rendu `renders/logo3d_still.png`).
4. Suivez les marqueurs temporels pour caler spray, notes, morph et lockup.

## Recommandations plugins
- Trapcode Particular 5+ ou Stardust 1.6+ (morph par paths). Sans plugin, utilisez des stocks de fumée + reveals par mattes.

## Export
- Priorité: 1080x1920 (H.264, 15 s). Masters ProRes recommandés. Web: WebM VP9.

## Paramètres de style (modifiable via brand.json)
- Bleu: #2F80FF (provisoire).
- FPS: 30.
- Style: A (Chrome+Verre bleu).
- Reveal: morph (fumée → logo).

## Notes
- Le script Blender lit `brand/brand.json` s’il existe (sinon valeurs par défaut).
- Vous pouvez ajuster extrude/bevel/émission dans le script.
