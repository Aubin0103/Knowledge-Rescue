# Knowledge Rescue

**Knowledge Rescue** est une plateforme communautaire pour enregistrer et préserver les savoirs oraux menacés de disparition : recettes de cuisine, langues et récits, artisanat, musique, médecine traditionnelle, rites et fêtes.

> *« Avant que la voix ne s'éteigne, qu'elle soit entendue. »*

Chaque personne peut soumettre une « fiche » de savoir (texte, audio enregistré depuis le micro, ou vidéo enregistrée depuis la caméra), qui vient enrichir une galerie collective organisée par catégories.

## Membres du groupe

- BOUGMA Kiswendsida Stéphane Aubin
- OUEDRAOGO Rafa Nancy
- TOUGOUMA Emmanuella
- ZONGO Yabyouré Aurélie
- COULIBALY Nick Francis

## Structure du projet

```
.
├── index.html    # Structure de la page
├── style.css     # Styles (variables, thème, composants)
└── script.js     # Logique : stockage, enregistreurs audio/vidéo, rendu dynamique
```

## Sections de la page

- **Nav** — logo, barre de recherche, liens d'ancrage vers les sections.
- **Hero** — accroche principale et waveform décorative animée.
- **Interfaces** (`#interfaces`) — trois maquettes de téléphone illustrant le parcours : accueil/exploration, écran d'enregistrement, fiche détaillée avec chaîne de transmission.
- **Problème** — liste des savoirs actuellement en danger, à titre d'illustration.
- **Comment ça marche** (`#process`) — les 4 étapes : Enregistrer, Situer, Retrouver, Transmettre.
- **Exemple** (`#example`) — met en avant automatiquement la toute première fiche publiée par les utilisateurs, ou un message d'invitation si la galerie est vide.
- **Contribuer** (`#contribute`) — formulaire de soumission avec enregistreur audio et enregistreur vidéo intégrés.
- **Explorer** (`#gallery`) — galerie classée par catégorie, avec compteur de fiches et fiches masquées consultables séparément.
- **Footer** — appel à l'action final et signature.

## Fonctionnalités principales

- **Formulaire de contribution** : titre, catégorie, région, langue, chaîne de transmission (de qui à qui le savoir a été transmis), description.
- **Enregistreur audio** intégré (via `MediaRecorder` + `getUserMedia`), avec minuteur, lecture et suppression avant publication.
- **Enregistreur vidéo** intégré, avec aperçu caméra en direct, minuteur, lecture et suppression avant publication.
- **Galerie par catégories** : Cuisine, Langues & récits, Artisanat, Musique, Médecine traditionnelle, Rites & fêtes — avec compteur de fiches par catégorie.
- **Mise en avant automatique** de la toute première fiche publiée comme « exemple » en haut de page.
- **Gestion des fiches** : masquer / ré-afficher / supprimer chaque fiche, avec confirmation avant suppression définitive.
- **Repli automatique en cas de stockage plein** : si l'espace navigateur est insuffisant, l'app tente de republier la fiche sans la vidéo, puis sans aucun média, plutôt que de perdre la contribution.
- **Animations douces** : waveform animée, apparition au scroll, respect de `prefers-reduced-motion`.

## Technologies utilisées

- **HTML** — structure sémantique de la page, sections découpées par `<section>`
- **CSS** — mise en page et charte graphique (variables CSS, thème indigo/ocre/argile), polices `Newsreader`, `Work Sans` et `IBM Plex Mono`
- **JavaScript** (vanilla, sans dépendance externe) :
  - `localStorage` pour la persistance des fiches dans le navigateur
  - `MediaRecorder` et `navigator.mediaDevices.getUserMedia` pour l'audio/vidéo
  - `IntersectionObserver` pour les animations au défilement

## Structure des données

Chaque fiche est stockée comme un objet JSON dans `localStorage` (clé `kr_submissions`) :

```json
{
  "id": "identifiant unique",
  "title": "Titre du savoir",
  "category": "Cuisine | Langues & récits | Artisanat | Musique | Médecine traditionnelle | Rites & fêtes",
  "region": "Région d'origine",
  "lang": "Langue (optionnel)",
  "chain": "Chaîne de transmission (optionnel)",
  "desc": "Description",
  "audioData": "URL base64 (optionnel)",
  "videoData": "URL base64 (optionnel)",
  "hidden": false,
  "date": "date ISO de création"
}
```

## Comment lancer / utiliser le site

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/Aubin0103/Knowledge-Rescue.git
   cd Knowledge-Rescue
   ```
2. Lancer un petit serveur local (nécessaire pour que le micro et la caméra fonctionnent) :
   ```bash
   python3 -m http.server 8000
   ```
3. Ouvrir `http://localhost:8000` dans le navigateur.
4. Se rendre dans la section **Contribuer** pour ajouter une fiche (texte, audio et/ou vidéo), puis dans **Explorer** pour parcourir les fiches par catégorie.

## Limites importantes

- **Stockage local uniquement** : les fiches ne sont enregistrées que dans le navigateur de la personne qui les soumet. Elles ne sont **pas partagées** avec les autres visiteurs et disparaissent si le cache du navigateur est vidé.
- **Micro/caméra nécessitent HTTPS ou localhost** : `getUserMedia` est bloqué sur les connexions HTTP non sécurisées.
- **Quota de stockage** : les fichiers audio/vidéo en base64 peuvent rapidement saturer le quota de `localStorage` ; l'app gère ce cas en dégradant la fiche plutôt que d'échouer silencieusement.
- **Barre de recherche non fonctionnelle** : présente visuellement mais pas encore reliée à une logique de filtrage.

## Pistes d'évolution

- Backend partagé (API + base de données) pour une galerie réellement collective
- Connecter la barre de recherche à un filtrage réel des fiches
- Export/import des fiches (JSON) pour sauvegarde ou migration
- Sous-titres/transcription automatique des enregistrements audio et vidéo
