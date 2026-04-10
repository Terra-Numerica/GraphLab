/**
 * Jeu de Coloration de Graphes - Terra Numerica
 * Point d'entrée principal avec intégration du framework
 */

import Framework from '/framework/framework.js';
import { GraphColoringGame } from './game.js';

// Initialisation du framework Terra Numerica
const framework = new Framework();

// Créer la scène, caméra et renderer
// Récupérer les paramètres principaux initialisés par le framework
const { scene, camera, renderer } = framework.mainParameters;

// Initialiser le jeu (déclarer la variable avant de créer l'UI)
let game;

// Créer l'interface utilisateur
function createUI() {
    // Palette de couleurs
    const colorPalette = document.createElement('div');
    colorPalette.id = 'color-palette';
    colorPalette.innerHTML = `
        <h3>🎨 Couleurs</h3>
        <div>
            <div class="color-button" style="background-color: #ff0000" data-color="0"></div>
            <div class="color-button" style="background-color: #0000ff" data-color="1"></div>
            <div class="color-button" style="background-color: #00ff00" data-color="2"></div>
            <div class="color-button" style="background-color: #ffff00" data-color="3"></div>
        </div>
    `;
    document.body.appendChild(colorPalette);

    // Informations du jeu
    const gameInfo = document.createElement('div');
    gameInfo.id = 'game-info';
    gameInfo.innerHTML = `
        <h3>📊 Informations</h3>
        <div class="info-row">
            <span class="info-label">Niveau:</span>
            <span class="info-value" id="level-number">1 / 5</span>
        </div>
        <div class="info-row">
            <span class="info-label">Graphe:</span>
            <span class="info-value" id="level-name">Triangle</span>
        </div>
        <div class="info-row">
            <span class="info-label">Nœuds coloriés:</span>
            <span class="info-value" id="colored-nodes">0 / 3</span>
        </div>
    `;
    document.body.appendChild(gameInfo);

    // Contrôles
    const controls = document.createElement('div');
    controls.id = 'controls';
    controls.innerHTML = `
        <button class="game-button" id="reset-btn">🔄 Recommencer</button>
        <button class="game-button" id="next-btn">➡️ Niveau suivant</button>
    `;
    document.body.appendChild(controls);

    // Instructions
    const instructions = document.createElement('div');
    instructions.id = 'instructions';
    instructions.innerHTML = `
        <strong>🎯 Objectif :</strong> Coloriez tous les nœuds sans que deux nœuds reliés aient la même couleur
    `;
    document.body.appendChild(instructions);

    // Message de victoire
    const victoryMessage = document.createElement('div');
    victoryMessage.id = 'victory-message';
    victoryMessage.innerHTML = `
        <h2>🎉 Bravo !</h2>
        <p id="victory-text"></p>
        <button class="game-button" id="continue-btn">Continuer</button>
    `;
    document.body.appendChild(victoryMessage);

    // Événements des boutons de couleur
    document.querySelectorAll('.color-button').forEach(button => {
        button.addEventListener('click', () => {
            const colorIndex = parseInt(button.dataset.color);
            game.setCurrentColor(colorIndex);
            // Ne pas recolorer automatiquement le sommet sélectionné :
            // l'utilisateur doit cliquer explicitement sur un sommet pour appliquer la couleur.
        });
    });

    // Événement bouton reset
    document.getElementById('reset-btn').addEventListener('click', () => {
        game.resetLevel();
    });

    // Événement bouton niveau suivant
    document.getElementById('next-btn').addEventListener('click', () => {
        game.nextLevel();
    });

    // Événement bouton continuer (victoire)
    document.getElementById('continue-btn').addEventListener('click', () => {
        game.nextLevel();
    });
}

// Ajouter des boutons à la bannière Terra Numerica
// Add 'Règles' button to navbar (use parameter names expected by the framework)
framework.addButtonToNavbar({
    textButton: '📖 Règles',
    onclickFunction: () => {
        const modal = framework.getPermanentModal();
        modal.setTitle('📖 Règles du jeu');
        modal.setContent(`
            <div style="font-size: 16px; line-height: 1.8;">
                <h3 style="color: #4ade80;">🎯 Objectif</h3>
                <p>Coloriez tous les nœuds du graphe en respectant une règle simple :</p>
                <p style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px;">
                    <strong>Deux nœuds reliés par une arête ne peuvent pas avoir la même couleur.</strong>
                </p>
                
                <h3 style="color: #4ade80; margin-top: 20px;">🎨 Comment jouer</h3>
                <ul>
                    <li>Sélectionnez une couleur dans la palette à gauche</li>
                    <li>Cliquez sur un nœud pour le colorier</li>
                    <li>Essayez d'utiliser le minimum de couleurs possible !</li>
                </ul>

                <h3 style="color: #4ade80; margin-top: 20px;">🧠 Concept mathématique</h3>
                <p>Ce jeu illustre le <strong>problème de coloration de graphes</strong>, un concept important en théorie des graphes.</p>
                <p>Le nombre minimum de couleurs nécessaires pour colorier un graphe s'appelle le <strong>nombre chromatique</strong>.</p>
            </div>
        `);
        modal.open();
    }
});

framework.addButtonToNavbar({
    textButton: '🎮 Niveaux',
    onclickFunction: () => {
        const modal = framework.getPermanentModal();
        modal.setTitle('🎮 Choix du niveau');
        
        let content = '<div style="font-size: 16px;">';
        game.levels.forEach((level, index) => {
            content += `
                <button 
                    class="game-button" 
                    style="width: 100%; margin: 10px 0; font-size: 18px;"
                    onclick="window.loadLevel(${index}); document.querySelector('.modal').classList.remove('show');"
                >
                    Niveau ${index + 1} : ${level.name} (${level.minColors} couleurs min)
                </button>
            `;
        });
        content += '</div>';
        
        modal.setContent(content);
        modal.open();
    }
});

// Fonction globale pour charger un niveau
window.loadLevel = (index) => {
    game.loadLevel(index);
};

// Créer l'interface (les handlers utilisent la variable `game` qui sera assignée juste après)
createUI();

// Instancier le jeu après la création des éléments DOM afin que updateUI() puisse les trouver
game = new GraphColoringGame(scene, camera, renderer);
// Exposer l'objet jeu/global pour debug dans la console
window.game = game;
window.renderer = renderer;
window.camera = camera;

// Diagnostic helper: si aucun nœud n'est présent, afficher des informations et ajouter un marqueur visuel
setTimeout(() => {
    try {
        console.log('Diagnostic: game.nodes.length=', game.nodes.length, 'nodeObjects.length=', game.nodeObjects.length, 'edgeObjects.length=', game.edgeObjects.length);
        if (game.nodeObjects.length === 0) {
            console.warn('Aucun nœud rendu — ajout d\'un marqueur de debug au centre');
            // Ajouter une sphère de debug au centre de la scène
            import('three').then(THREE => {
                const geo = new THREE.SphereGeometry(1, 16, 16);
                const mat = new THREE.MeshStandardMaterial({ color: 0xff00ff });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(0,0,0);
                window.scene.add(mesh);
            }).catch(e => console.error('Unable to import three for diagnostic', e));
        }
    } catch (e) {
        console.error('Diagnostic helper failed', e);
    }
}, 500);

// Boucle de rendu
function animate() {
    requestAnimationFrame(animate);
    
    game.update();
    framework.update();
    
    renderer.render(scene, camera);
}

// Gestion du redimensionnement
framework.onResize();

// Démarrer l'animation
animate();
