<?php

// Fichier php pour le traitement Client/Serveur

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// _________________________________________________________


// Fonction pour charger le .txt de motsvides
function chargerMotsVides() {

    $fichier = '../data/utils/motsvides.txt';

    if (!file_exists($fichier)) {
        // Retourne une erreur si le fichier est pas la
        error_log("Fichier motsvides.txt manquant à: $fichier");
        return [];
    }
    
    // Utilisation de "file()" pour lire ligne par ligne & ignorer les lignes vides
    $lignes = file($fichier, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    // Nettoyer et normaliser en minuscule (trim, minuscule)
    $mots = array_map('trim', $lignes);
    $mots = array_map('mb_strtolower', $mots);
    
    // Retourne un tableau de mots vides uniques
    return array_unique(array_filter($mots)); 
}

// fonction pour nettoyer le texte
function nettoyerTexte($texte) {

    $texte = mb_strtolower($texte, 'UTF-8');

    // Suppression des accents
    // 'été' et 'ete' comme mots différents.
    $texte = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texte); 
    
    // Remplacer ponctuation et char speciaux par des espaces, sauf les lettres et chiffres
    $texte = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $texte);

    // Supprimer les chiffres ssi pertinent
    $texte = preg_replace('/[0-9]+/', ' ', $texte);
    
    // Reduire les espaces multiples à un seul espace
    $texte = preg_replace('/\s+/', ' ', $texte);

    return trim($texte);
}

// tokenisation
function tokeniser($texte) {
    // Explode sur l'espace
    return explode(' ', $texte);
}

// filtrage des mots
function filtrerMots($mots, $motsvides, $longueurMin = 3) {
    // On met les mots vides dans un tableau associatif
    $motsvides_map = array_flip($motsvides);
    
    return array_filter($mots, function($mot) use ($motsvides_map, $longueurMin) {
        // on verifie la longueur et si le mot n'est PAS dans la liste des mots vides
        return mb_strlen($mot) >= $longueurMin && !isset($motsvides_map[$mot]);
    });
}
// fonction qui compte les occurences
function compterOccurrences($mots){
    $compteur = [];
    foreach ($mots as $mot) {
        if (empty($mot)) continue;
        if (!isset($compteur[$mot])) {
            $compteur[$mot] = 0;
        }
        $compteur[$mot]++;
    }
    // Trier par fréquence décroissante
    arsort($compteur);
    
    return $compteur;
}

// _____________________________________

// Traitement des requete AJAX
if($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error' => 'Méthode non autorisée. Utilisez POST.'
    ]);
    exit;
}

// Recuperer le texte envoyé par JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$texteOriginal = '';

// Si JSON est valide
if ($data && isset($data['texte'])) {
    $texteOriginal = $data['texte'];
}
// Si le texte est envoyé via FormData (au cas où)
else if (isset($_POST['texte'])) {
    $texteOriginal = $_POST['texte'];
}

if (empty($texteOriginal)) {
    echo json_encode([
        'success' => false,
        'error' => 'Aucun texte fourni'
    ]);
    exit;
}

// Demarrage du pipeline de traitement
try {
    // on charger les mots vides .txt
    $motsvides = chargerMotsVides();
    
    // Nettoyer le texte
    $texteNettoye = nettoyerTexte($texteOriginal);
    
    // Tokeniser
    $mots = tokeniser($texteNettoye);
    
    // Filtrer
    $motsFiltres = filtrerMots($mots, $motsvides);
    
    // Compter
    $compteur = compterOccurrences($motsFiltres);
    
    // 6. Limiter aux 100 premiers par defaut
    $compteur = array_slice($compteur, 0, 100, true);
    
    // stats pour le client
    $stats = [
        'totalMots' => count($mots),
        'motsUniques' => count(array_unique($mots)),
        'motsFiltres' => count($motsFiltres),
        'motsSignificatifs' => count($compteur),
        'motsVidesRetires' => count($mots) - count($motsFiltres),
        'nombreMotsVides' => count($motsvides)
    ];

    // Preparer les donnees pour wordcloud2.js
    $donneesNuage = [];
    foreach ($compteur as $mot => $freq) {
        $donneesNuage[] = [$mot, $freq];
    }
    
    // Validation finale
    if (count($donneesNuage) === 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Aucun mot significatif trouve dans le texte apres filtrage.',
            'stats' => $stats
        ]);
        exit;
    }

    // Retourner le resultat
    echo json_encode([
        'success' => true,
        'donnees' => $donneesNuage,
        'statistiques' => $stats,
        'message' => 'Analyse terminee avec succes'
    ], JSON_UNESCAPED_UNICODE); // pour gerer les accents
    
} catch (Exception $e) {
    // Gestion des erreurs generales
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors du traitement: ' . $e->getMessage()
    ]);
}

?>