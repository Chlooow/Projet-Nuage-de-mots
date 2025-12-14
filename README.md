# Projet-Nuage-de-mots
## NimbusWords

**Analyse de texte et génération de nuages de mots interactifs**  
Projet pédagogique UE *Internet et technologies de l’hypermédia* - Master 1  

Projet réalisé dans le cadre du Master Informatique et Big Data, option Technologies de l'Hypermédia. Application web permettant d'analyser la fréquence des mots dans un texte et de visualiser les résultats sous forme de nuage de mots interactif. L'utilisateur peut saisir directement du texte ou importer un fichier .txt. Le système effectue le nettoyage, la tokenisation et le comptage des occurrences avant de générer une visualisation dynamique. 

#### Objectifs pédagogiques

- Comprendre et expliquer le flux de traitement d’un texte brut.
- Représenter l’architecture simple d’un système Web client–serveur.
- Manipuler les technologies Web de base : HTML, CSS, JavaScript et PHP.
- Produire une documentation claire et structurée.


### Présentation

**NimbusWords** est une application Web permettant d’analyser un texte brut et d’en extraire les mots-clés les plus significatifs sous forme de nuage de mots interactif. L’outil est conçu pour être simple, rapide et accessible directement depuis le navigateur, sans installation ni compte utilisateur.

**Fonctionnalités principales :**
- Saisie directe d’un texte ou import de fichier `.txt`.
- Nettoyage du texte et suppression des mots vides.
- Calcul de la fréquence des mots significatifs.
- Visualisation dynamique sous forme de nuage de mots proportionnel aux fréquences.
- Statistiques complémentaires : nombre de mots, mots uniques, moyenne et écart-type des fréquences.
- Export des résultats au format CSV ou PNG.

---
## Ce que contient le projet :
```shell
.
├── css/
│   └── style.css          # Feuille de style principale
├── data/
│   ├── exports/           # Destination des fichiers exportés (PNG, CSV)
│   ├── images/            # Assets graphiques du projet
│   ├── txt_test/          # Textes bruts pour les tests
│   └── utils/
│       └── motsvides.txt  # Liste des mots à ignorer (lu par PHP)
├── html/
│   └── index.html         # Structure de la page principale
├── js/
│   └── main.js            # Logique client, événements et requête Fetch
├── php/
│   └── index.php          # Moteur d'analyse et de calculs (Serveur PHP)
└── README.md
```

---

## Installation

1. Cloner le dépôt :  
   ```bash
   git clone https://github.com/ton-compte/NimbusWords.git

2. Placer le projet dans un serveur local compatible PHP (ex. XAMPP, WAMP, MAMP).

3. Accéder à `index.html` depuis le navigateur.

4. Saisir un texte ou importer un fichier `.txt` pour générer le nuage de mots.

---

## Technologies utilisées

- **Frontend :** HTML5, CSS3, JavaScript, Bootstrap, Font-Awesome
- **Backend :** PHP
- **Bibliothèque externe :** [wordcloud2.js](https://github.com/timdream/wordcloud2.js) pour la génération du nuage de mots
- **Fichier mots vides :** `data/utils/motsvides.txt`

## Auteur : 
Chloé Makoundou