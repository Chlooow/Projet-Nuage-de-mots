// Variable pour stocker les dernières données pour le redimensionnement
    let dernieresDonnees = null;
document.addEventListener('DOMContentLoaded', () => {
    
    console.log('Application NimbusWords initialisée');

    // les elements HTML
    const inputFile = document.getElementById('telechargement-fichier');
    const btnImporter = document.getElementById('btn-importer');
    const textarea = document.getElementById('saisie-texte');
    const btnGenerer = document.querySelector('.btn-generer');
    const boiteResultat = document.querySelector('.boite-resultat');
    const iconeParametres = document.querySelector('.icone-parametres');
    const iconeAide = document.querySelector('.icone-aide');

    const btnExporterNuage = document.getElementById('btn-exporter-nuage');
    const btnExporterCSV = document.getElementById('btn-exporter-csv');
    const groupeExport = document.querySelector('.groupe-actions-export');
    

    // Definition des variables globales
    window.boiteResultat = boiteResultat;
    window.btnGenerer = btnGenerer;


    // Import des fichiers .txt
    if (btnImporter && inputFile) {
        btnImporter.addEventListener('click', () => {
            inputFile.click();
        });
        
        inputFile.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            
            if (!file) return;
            
            try {
                console.log(`Chargement du fichier: ${file.name}`);
                const texte = await lireFichier(file);
                textarea.value = texte;
                afficherSucces(`Fichier "${file.name}" charge avec succss (${texte.length} caracteres)`);
            } catch (error) {
                afficherErreur(error.message);
            }
        });
    }

    // Generer le nuage de mot

    if (btnGenerer) {
        btnGenerer.addEventListener('click', async () => {
            const texte = textarea.value;
            const validation = validerTexte(texte);
            
            nettoyerResultat(); // enlever le canva précédent
            
            if (!validation.valide) {
                afficherErreur(validation.message);
                return;
            }

            if (!verifierWordCloud()) {
                return;
            }
            
            console.log(`Envoi de ${validation.nombreMots} mots au serveur pour analyse...`);
            afficherChargement(true);

            try {
                const resultat = await analyserTexteServeur(texte);
                
                afficherChargement(false); // Desac etat de chargement
                
                console.log('Reponse du serveur reçue');
                
                if (!resultat.donnees || resultat.donnees.length === 0) {
                    afficherErreur('Aucun mot significatif trouve dans le texte');
                    return;
                }
                
                dernieresDonnees = resultat; // Stocke les donnees pour le redimensionnement
                
                genererNuageVisuel(resultat.donnees);
                afficherStatistiques(resultat.statistiques);
                

                if (groupeExport) {
                    groupeExport.style.display = 'flex';
                }
                
                afficherSucces('Nuage de mots généré avec succès !');
                
            } catch (error) {
                afficherChargement(false); // Desactive l'etat de chargement en cas d'erreur
                console.error('Erreur lors de la génération:', error);
                afficherErreur('Erreur lors de la génération du nuage: ' + error.message);
            }
        });
    }

    // generation du visuel du nuage

    function genererNuageVisuel(donneesNuage) {
        if (!boiteResultat) return;
        
        // Nettoyer l'interieur avant de creer la nouvelle toile
        boiteResultat.innerHTML = '';
        
        // Creer la toile 
        const canvas = document.createElement('canvas');
        canvas.id = 'nuage-canvas';
        boiteResultat.appendChild(canvas);
        
        // Ajuster la taille du canvas a son conteneur
        const largeur = boiteResultat.offsetWidth - 30; 
        const hauteur = boiteResultat.offsetHeight - 30;
        
        canvas.width = largeur > 100 ? largeur : 600;
        canvas.height = hauteur > 100 ? hauteur : 400;
        
        console.log(`Generation du nuage: ${canvas.width}x${canvas.height}px`);
        
        try {
            WordCloud(canvas, {
                list: donneesNuage,
                gridSize: 8,
                weightFactor: function(size) {
                    return Math.pow(size, 0.7) * canvas.width / 60;
                },
                fontFamily: 'Cherry Bomb One, sans-serif',
                colorType: 'literal',
                color: function() {
                    const couleurs = [
                        '#659aacff',
                        '#90EE90',
                        '#FFB6C1',
                        '#F08080',
                        '#FFA07A',
                        '#BA55D3', 
                        '#afa868ff', 
                        '#DDA0DD'  
                    ];
                     return couleurs[Math.floor(Math.random() * couleurs.length)];
                },
                rotateRatio: 0.3,
                rotationSteps: 2,
                backgroundColor: 'transparent',
                minSize: 5,
                drawOutOfBound: false,
                shrinkToFit: true,
                
                hover: function(item) {
                     if (item) { canvas.style.cursor = 'pointer'; } 
                     else { canvas.style.cursor = 'default'; }
                },
                click: function(item) {
                    if (item) { console.log(`Mot clique: "${item[0]}" (${item[1]} occurrences)`); }
                }
            });
            console.log('Nuage de mots affiche');
        } catch (error) {
            console.error('Erreur WordCloud:', error);
            afficherErreur('Erreur lors de l\'affichage du nuage');
        }
    }


    // icone de param + icone d'aide
    if (iconeParametres) {
        iconeParametres.addEventListener('click', () => {
            alert('Paramètres\n\nPour modifier la liste des mots vides, éditez le fichier:\ndata/utils/motsvides.txt');
        });
    }

    if (iconeAide) {
        iconeAide.addEventListener('click', () => {
            const messageAide = `
                AIDE - NimbusWords
                1. Saisissez votre texte ou utilisez le bouton "Importer" pour charger un fichier .txt.
                2. Cliquez sur "Générer" pour lancer l'analyse côté serveur.
                3. Le nuage de mots-clés s'affiche, la taille du mot est proportionnelle à sa fréquence.
                `.trim();
            alert(messageAide);
        });
    }

    // redimensionner la fenetre
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {

            const canvas = document.getElementById('nuage-canvas');

            if (canvas && dernieresDonnees && dernieresDonnees.donnees) {
                console.log('Redimensionnement du nuage...');
                // Appel la fonction pour redessiner le nuage avec les memes donnees
                genererNuageVisuel(dernieresDonnees.donnees); 
            }
        }, 500);
    });

if(btnExporterNuage) {
    btnExporterNuage.addEventListener('click', telechargerPNG);
}

if(btnExporterCSV) {
    btnExporterCSV.addEventListener('click', telechargerCSV);
}

// débugage
console.log(document.getElementById('btn-exporter-nuage'));
console.log(document.getElementById('btn-exporter-csv'));
console.log(dernieresDonnees);

});


// _____________________________________________________________________________________

// fonction qui lit le fichier
function lireFichier(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Erreur de lecture du fichier.'));
        reader.readAsText(file, 'UTF-8');
    });
}

function validerTexte(texte) {
    const texteNettoye = texte.trim();
    if (texteNettoye.length === 0) {
        return { valide: false, message: 'Le champ de saisie est vide.' };
    }
    const nombreMots = texteNettoye.split(/\s+/).length; 
    if (nombreMots < 1) { // 1 pour les tests vite fais
        return { valide: false, message: 'Veuillez entrer du texte.' };
    }
    return { valide: true, nombreMots: nombreMots };
}

async function analyserTexteServeur(texte) {
    try {
        const response = await fetch('../php/index.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ texte: texte }),
        });
        
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || `Erreur lors du traitement. (Statut HTTP: ${response.status})`);
        }
        
        return data; 
        
    } catch (error) {
        throw new Error(error.message || 'La communication avec le serveur a echoue. Verifiez le chemin vers index.php.');
    } 
}


// heuristique de nielsen : donner un feeback
function creerOuTrouverMessageContainer() {
    let container = document.getElementById('message-statut');
    if (!container) {
        container = document.createElement('div');
        container.id = 'message-statut';
        container.style.position = 'fixed'; 
        container.style.top = '0';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.zIndex = '1000';
        document.body.appendChild(container);
    }
    return container;
}

function afficherMessage(message, type, duree = 5000) {
    const container = creerOuTrouverMessageContainer();
    container.textContent = message;
    
    container.className = ''; 
    container.classList.add('visible');

    if (type === 'success') {
        container.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        container.style.backgroundColor = '#F44336';
    }
    container.style.opacity = '1';

    setTimeout(() => {
        container.style.opacity = '0';
    }, duree);
}

function afficherSucces(message) {
    afficherMessage(`${message}`, 'success');
}

function afficherErreur(message) {
    afficherMessage(`${message}`, 'error', 8000);
}

function afficherChargement(enCours) {
    if (window.btnGenerer) {
        window.btnGenerer.disabled = enCours;
        window.btnGenerer.textContent = enCours ? 'Analyse en cours...' : '☁️Générer☁️';
    }
    if (window.boiteResultat && enCours) {
        window.boiteResultat.innerHTML = '<p class="message-chargement">Analyse en cours...</p>';
    } 
}

function nettoyerResultat() {
     const statsBox = document.getElementById('stats-nuage');
     const groupeExport = document.querySelector('.groupe-actions-export');

     if (window.boiteResultat) window.boiteResultat.innerHTML = '';
     if (statsBox) statsBox.remove();
     if (groupeExport) groupeExport.style.display = 'none';
}

function verifierWordCloud() {
    if (typeof WordCloud === 'undefined') {
        afficherErreur('La librairie wordcloud2.js n\'est pas chargée. Vérifiez votre connexion et index.html.');
        return false;
    }
    return true;
}

//exporter les stats et traitement
function telechargerCSV() {
    try {
        if (!dernieresDonnees || !dernieresDonnees.donnees) {
            return afficherErreur("Aucune donnée d'analyse disponible pour l'export CSV.");
        }
        
        const donnees = dernieresDonnees.donnees; 
        let csvContent = "Mot,Frequence\n";
        
        // Ajouter les données (Mot, Freq)
        donnees.forEach(([mot, freq]) => {
            const motNettoye = mot.replace(/"/g, '""'); 
            csvContent += `"${motNettoye}",${freq}\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `nimbuswords_export_stats_${new Date().toISOString().slice(0, 10)}.csv`); 
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        afficherSucces('Fichier CSV téléchargé avec succès !');
        
    } catch (error) {
        console.error('Erreur lors du téléchargement CSV:', error);
        afficherErreur("Erreur lors de l'exportation du CSV.");
    }
}

// fonction qui telecharge le nuage
function telechargerPNG() {
    try {
        const canvas = document.querySelector('.boite-resultat canvas');
        if (!canvas) {
            return afficherErreur("Le nuage de mots n'est pas encore généré.");
        }

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png'); // Convertit la toile en PNG Data URL
        link.setAttribute('download', `nimbuswords_nuage_${new Date().toISOString().slice(0, 10)}.png`); 
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        afficherSucces('Image PNG téléchargée avec succès !');
        
    } catch (error) {
        console.error('Erreur lors du téléchargement PNG:', error);
        afficherErreur("Erreur lors de l'exportation du PNG.");
    }
}

function afficherStatistiques(stats) {
    let statsDiv = document.getElementById('stats-nuage');
    if (!statsDiv) {
        statsDiv = document.createElement('div');
        statsDiv.id = 'stats-nuage';
        statsDiv.className = 'stats-box box-style scrollable-stats'; 
        
        const conteneurResultat = document.querySelector('.conteneur-resultat');
        if (conteneurResultat) conteneurResultat.insertAdjacentElement('beforeend', statsDiv); 

    }

    const donnees = dernieresDonnees ? dernieresDonnees.donnees : [];
    
    let motsListHTML = '';
    if (donnees.length > 0) {

        // Crée la liste ordonnée des mots du nuage (jusqu'à 30 mots)
        motsListHTML = '<h4>Top Mots & Fréquences</h4>';
        motsListHTML += '<ol class="top-mots-list">';
        donnees.forEach(([mot, freq]) => {
            motsListHTML += `<li>${mot} : <span>${freq}</span> fois</li>`;
        });
        motsListHTML += '</ol>';
    }

    statsDiv.innerHTML = `
        <h3>Statistiques d'Analyse</h3>
        <ul>
            <li>Nombre de Lignes: ${stats.nombreLignes || 0}</li>
            <li>Mots Totaux (brut): ${stats.totalMots || 0}</li>
            <li>Mots Uniques: ${stats.motsUniques || 0}</li>
            <li>Mots Filtrés (nettoyés): ${stats.motsFiltres || 0}</li>
            <li>Mots Signifiatifs (dans le nuage): ${stats.motsSignificatifs || 0}</li>
        </ul>
        <h4>Statistiques de Fréquence</h4>
        <ul>
            <li>Moyenne des fréquences: ${stats.moyenneFreq || 0}</li>
            <li>Médiane des fréquences: ${stats.medianeFreq || 0}</li>
            <li>Écart-type des fréquences: ${stats.ecartTypeFreq || 0}</li>
        </ul>
        
        ${motsListHTML} `;
}