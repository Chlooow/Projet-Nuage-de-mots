// Fichier script

document.addEventListener('DOMContentLoaded', () => {
    
    // les éléments HTML
    const inputFile = document.getElementById('telechargement-fichier');
    const btnImporter = document.getElementById('btn-importer');
    const textarea = document.getElementById('saisie-texte');
    const btnGenerer = document.querySelector('.btn-generer');
    const boiteResultat = document.querySelector('.boite-resultat');

    // gerer l'import de fichier.txt
    btnImporter.addEventListener('click', () => {
        inputFile.click();
    });

    inputFile.addEventListener('change', (event) => {
        const file = event.target.files[0];

        if(file && file.name.endsWith('.txt')) {
            const reader = new FileReader();

            reader.onload = function(e) {
                textarea.value = e.target.result;
            };
            reader.readAsText(file);
        } else {
            alert("Veuillez sélectionner un fichier au format .TXT uniquement");
                textarea.value = "";
        }
    });

    // Liste des mots-vides fourni par le prof
    const motsvide = new Set([
        'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'des', 'à', 'au', 'aux',
        'et', 'ou', 'ni', 'car', 'donc', 'or', 'ni', 'car', 'pour', 'par', 'avec',
        'dans', 'sur', 'sous', 'vers', 'chez', 'entre', 'malgré', 'depuis', 'sans',
        'ce', 'cet', 'cette', 'ces', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles',
        'je', 'tu', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
        'est', 'sont', 'être', 'avoir', 'fait', 'faire', 'tout', 'tous', 'plus', 
        'moins', 'comme', 'comment', 'quand', 'quoi', 'qui', 'que', 'pas', 'si', 
        'y', 'en', 'moi', 'toi', 'lui', 'eux', 'leurs', 'leur', 'aussi', 'alors', 
        'mais', 'où', 'ceci', 'cela', 'chaque', 'mille', 'cent', 'ans', 'an', 'jour',
        'va', 'va', 'même', 'même'
    ]);

        // Icône aide
        document.querySelector('.icone-aide').addEventListener('click', function() {
            alert('Aide:\n\n1. Entrez votre texte dans la zone de gauche\n2. Ou importez un fichier .txt\n3. Cliquez sur "Générer" pour créer votre nuage de mots');
        });

        // Icône paramètres
        document.querySelector('.icone-parametres').addEventListener('click', function() {
            alert('Paramètres à venir...');
        });
});
