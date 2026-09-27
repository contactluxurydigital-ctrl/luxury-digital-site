# Luxury Digital — site vitrine

Site one-page de **Luxury Digital** : stratégie digitale, community management, création de contenu, shooting photo & vidéo et Reels à La Réunion.

Site 100 % statique : HTML + CSS + JavaScript vanilla. **Aucune dépendance, aucune étape de build**, polices auto-hébergées. Il se déploie tel quel sur Netlify, Vercel, GitHub Pages, OVH, o2switch…

## Lancer le site en local

```bash
npx serve .          # ou : python3 -m http.server 8080
```

Puis ouvrir http://localhost:3000 (ou :8080).

## Structure

```
index.html              La page (toutes les sections + SEO + données structurées)
css/style.css           Styles, palette, typographie, animations
js/main.js              Interactions (smooth scroll, reveal, compteurs, curseur, parallax…)
assets/fonts/           Instrument Serif + Manrope (woff2, licence OFL)
assets/img/             Vos photos (voir liste ci-dessous) + og-image + icône
favicon.svg             Favicon monogramme
robots.txt, sitemap.xml SEO
llms.txt                Résumé de l'activité pour les moteurs IA (ChatGPT, Perplexity, Gemini…)
site.webmanifest        Manifest (icône écran d'accueil)
404.html                Page d'erreur
```

## Ajouter vos photos

Déposez simplement vos fichiers dans `assets/img/` **avec exactement ces noms**. Tant qu'un fichier manque, un placeholder élégant s'affiche avec son nom (« Photo à venir — assets/img/… »).

| Fichier | Section | Format conseillé |
|---|---|---|
| `hero.jpg` | Hero — Laura en shooting | paysage, 2400 × 1600 |
| `terrain-1.jpg` | Mon terrain — portrait vertical | 900 × 1200 |
| `terrain-2.jpg` | Mon terrain — grande photo | 1600 × 1200 |
| `terrain-3.jpg` | Mon terrain — tournage Reel | 1400 × 1000 |
| `terrain-4.jpg` | Mon terrain — détail | 900 × 1200 |
| `terrain-5.jpg` | Mon terrain — behind the scenes | 900 × 1200 |
| `terrain-6.jpg` | Mon terrain — plan large | 1920 × 1080 |
| `service-strategie.jpg` | Carte 01 (au survol) | 1200 × 1500 |
| `service-community.jpg` | Carte 02 | 1200 × 1500 |
| `service-contenu.jpg` | Carte 03 | 1200 × 1500 |
| `service-shooting.jpg` | Carte 04 | 1600 × 1200 |
| `service-reels.jpg` | Carte 05 | 1600 × 1200 |
| `galerie-1.jpg` | Galerie — Shooting client (entre par la gauche) | 2000 × 1250 |
| `galerie-2.jpg` | Galerie — La Réunion (entre par la droite) | 2000 × 1250 |
| `galerie-3.jpg` | Galerie — Content day (zoom) | 2400 × 1350 |
| `galerie-4.jpg` | Galerie — Behind the scenes (sticky) | 1200 × 1600 |
| `laura-portrait.jpg` | Personnalité — portrait de Laura | 1200 × 1600 |

Conseils performance : exportez en JPG qualité 75–80, **moins de 300 Ko par image** (500 Ko max pour le hero). [Squoosh](https://squoosh.app) fait ça très bien. Pensez aussi à adapter les attributs `alt` dans `index.html` pour décrire vos vraies photos (bon pour le SEO et l'accessibilité).

**Vidéo dans le hero** : remplacez la balise `<img>` du hero par
`<video src="assets/video/hero.mp4" autoplay muted loop playsinline poster="assets/img/hero.jpg"></video>` (MP4 H.264, < 4 Mo).

## À personnaliser avant la mise en ligne

Les coordonnées ci-dessous sont des **valeurs provisoires** à remplacer partout (`index.html`, `llms.txt`, `robots.txt`, `sitemap.xml`) :

| Valeur provisoire | À remplacer par |
|---|---|
| `https://www.luxury-digital.re/` | votre vrai nom de domaine |
| `contact@luxury-digital.re` | votre email |
| `https://www.instagram.com/luxurydigital.re/` | votre compte Instagram |
| `https://wa.me/262600000000` | votre numéro WhatsApp (format international sans `+`, ex. `262692123456`) |

Exemple de remplacement en une commande (ici le numéro WhatsApp) :

```bash
grep -rl "262600000000" . --exclude-dir=.git | xargs sed -i 's/262600000000/262692123456/g'
```

**Avis Google** : le 1er avis est celui fourni ; les 2 suivants sont des **exemples** (marqués « Avis d'exemple — à remplacer » sur le site). Collez vos vrais avis Google dans `index.html` (section `<!-- 10 AVIS -->`) et retirez la classe `is-sample`.

**Clients** : la liste défilante se modifie dans la section `<!-- 09 PREUVE SOCIALE -->` (le bloc `credits__set` est volontairement répété deux fois pour une boucle parfaite — modifiez les deux, ainsi que la liste `sr-only` juste au-dessus).

## Direction artistique

Lumineuse, éditoriale et minimaliste : ~85 % de sections claires, le foncé réservé au CTA final et au footer.

| Rôle | Couleur |
|---|---|
| Fond principal (ivoire chaud) | `#F7F3EE` |
| Beige nude (sections chiffres / clients, cartes) | `#E8DDD2` |
| Beige sable (détails, placeholders) | `#D9CBBE` |
| Vert sauge (section « phrase », remplissages) | `#A8B5A2` |
| Sauge profonde (accents texte, lisible) | `#5E6E58` |
| Texte principal (anthracite doux) | `#1E1E1E` |
| Taupe (texte secondaire, légèrement assombri en `#766A61` pour la lisibilité) | `#8D8177` |

Typographie : Instrument Serif en très grands titres (casse éditoriale, italiques sauge) + Manrope pour les textes et les annotations en petites capitales espacées. Les couleurs se modifient en haut de `css/style.css`.

## Ce qui est intégré

**Effets** : smooth scrolling (molette desktop), zoom lent du hero au chargement, profondeur du hero à la souris, grain photographique, curseur custom avec « VIEW » sur les photos, titres lettre par lettre, manifeste ligne par ligne au scroll, compteurs animés, ticker horizontal en `mix-blend-mode`, grille éditoriale en parallax, cartes en hover 3D avec photo révélée, phrase illuminée lettre par lettre, timeline animée, galerie (gauche / droite / zoom / sticky), générique clients façon défilé, bouton CTA magnétique, header qui se masque au scroll, barre de progression, transitions douces de couleur de fond entre sections.

**Mobile** : parallax, profondeur souris, curseur, tilt 3D et smooth scroll JS sont désactivés ; le grain est statique. Les photos de services sont visibles directement (pas de hover sur mobile).

**Accessibilité** : `prefers-reduced-motion` respecté (toutes les animations coupées), lien d'évitement, textes découpés restitués via `aria-label`, contrastes de la palette, navigation clavier.

**SEO local** : requêtes ciblées — « community manager La Réunion », « créatrice de contenu La Réunion », « stratégie digitale La Réunion », « shooting photo vidéo entreprise La Réunion », « gestion Instagram entreprise La Réunion » — intégrées naturellement dans le title, la meta description, le h1, l'intro « Mon terrain », les cartes services, la FAQ (6 questions) et le footer (villes d'intervention). Données structurées avec zones desservies (Saint-Denis, Saint-Paul, Saint-Gilles, Saint-Leu, Saint-Pierre, Le Tampon, Saint-André, Saint-Benoît).

**SEO & moteurs IA** : balises title/description, Open Graph + Twitter Card (`og-image.jpg` fournie), canonical, géolocalisation La Réunion, données structurées JSON-LD (`ProfessionalService` / `LocalBusiness`, `Person`, catalogue des 5 services, `FAQPage`), FAQ visible, `robots.txt`, `sitemap.xml`, `llms.txt`, un seul `h1`, hiérarchie de titres propre.

**Scores Lighthouse (mobile)** : Performance 99 · Accessibilité 100 · SEO 100 · Bonnes pratiques 96 (les 4 points manquants viennent uniquement des photos pas encore déposées). Desktop : Performance 100.

**Performance** : zéro framework, ~58 Ko de CSS+JS non minifiés (~15 Ko compressés), polices locales préchargées (`font-display: swap`), images en `loading="lazy"` avec dimensions (pas de décalage de mise en page), hero en `fetchpriority="high"`, calculs de scroll limités aux éléments visibles.
