/**
 * Jeu de Coloration de Graphes - Terra Numerica
 * Adapté du jeu Scratch original
 */

import * as THREE from 'three';

export class GraphColoringGame {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        // Couleurs disponibles
        this.colors = [
            0xff0000, // Rouge
            0x0000ff, // Bleu
            0x00ff00, // Vert
            0xffff00  // Jaune
        ];
        
    // Force the player to choose a color first
    this.currentColor = null;
        this.nodes = [];
        this.edges = [];
        this.nodeObjects = [];
        this.edgeObjects = [];
        this.selectedNode = null;
        
        this.currentLevel = 0;
        this.levels = this.createLevels();
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.setupLights();
        this.setupEventListeners();
        this.loadLevel(0);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        this.scene.add(directionalLight);
    }

    createLevels() {
        return [
            // Niveau 1 : Triangle simple (3 couleurs minimum)
            {
                name: "Triangle",
                nodes: [
                    {id: 0, x: 0, y: 2, z: 0},
                    {id: 1, x: -2, y: -1, z: 0},
                    {id: 2, x: 2, y: -1, z: 0}
                ],
                edges: [
                    [0, 1], [1, 2], [2, 0]
                ],
                minColors: 3
            },
            // Niveau 2 : Carré (2 couleurs minimum)
            {
                name: "Carré",
                nodes: [
                    {id: 0, x: -2, y: 2, z: 0},
                    {id: 1, x: 2, y: 2, z: 0},
                    {id: 2, x: 2, y: -2, z: 0},
                    {id: 3, x: -2, y: -2, z: 0}
                ],
                edges: [
                    [0, 1], [1, 2], [2, 3], [3, 0]
                ],
                minColors: 2
            },
            // Niveau 3 : Pentagone
            {
                name: "Pentagone",
                nodes: [
                    {id: 0, x: 0, y: 3, z: 0},
                    {id: 1, x: 2.8, y: 1, z: 0},
                    {id: 2, x: 1.7, y: -2.5, z: 0},
                    {id: 3, x: -1.7, y: -2.5, z: 0},
                    {id: 4, x: -2.8, y: 1, z: 0}
                ],
                edges: [
                    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0]
                ],
                minColors: 3
            },
            // Niveau 4 : Graphe complet K4 (4 couleurs)
            {
                name: "Tétraèdre",
                nodes: [
                    {id: 0, x: 0, y: 3, z: 0},
                    {id: 1, x: -2, y: -1, z: 0},
                    {id: 2, x: 2, y: -1, z: 0},
                    {id: 3, x: 0, y: 0, z: 2}
                ],
                edges: [
                    [0, 1], [0, 2], [0, 3],
                    [1, 2], [1, 3], [2, 3]
                ],
                minColors: 4
            },
            // Niveau 5 : Graphe biparti
            {
                name: "Biparti",
                nodes: [
                    {id: 0, x: -3, y: 2, z: 0},
                    {id: 1, x: -3, y: -2, z: 0},
                    {id: 2, x: 3, y: 2, z: 0},
                    {id: 3, x: 3, y: 0, z: 0},
                    {id: 4, x: 3, y: -2, z: 0}
                ],
                edges: [
                    [0, 2], [0, 3], [0, 4],
                    [1, 2], [1, 3], [1, 4]
                ],
                minColors: 2
            }
            ,
            // Niveau 6 : Heptagone avec cordes (plus complexe)
            {
                name: "Heptagone",
                nodes: [
                    {id: 0, x: 0, y: 3.5, z: 0},
                    {id: 1, x: 2.9, y: 2.1, z: 0},
                    {id: 2, x: 3.5, y: -0.7, z: 0},
                    {id: 3, x: 1.8, y: -3, z: 0},
                    {id: 4, x: -1.8, y: -3, z: 0},
                    {id: 5, x: -3.5, y: -0.7, z: 0},
                    {id: 6, x: -2.9, y: 2.1, z: 0}
                ],
                edges: [
                    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],
                    [0,2],[1,3],[2,4],[3,5],[4,6]
                ],
                minColors: 3
            },
            // Niveau 7 : Roue (wheel) - centre connecté à tous les autres
            {
                name: "Roue",
                nodes: [
                    {id: 0, x: 0, y: 0, z: 0}, // centre
                    {id: 1, x: 0, y: 3, z: 0},
                    {id: 2, x: 2.6, y: 1.5, z: 0},
                    {id: 3, x: 1.6, y: -2.4, z: 0},
                    {id: 4, x: -1.6, y: -2.4, z: 0},
                    {id: 5, x: -2.6, y: 1.5, z: 0},
                    {id: 6, x: 0, y: 2.8, z: 0}
                ],
                edges: [
                    [1,2],[2,3],[3,4],[4,5],[5,6],[6,1],
                    [0,1],[0,2],[0,3],[0,4],[0,5],[0,6]
                ],
                minColors: 3
            },
            // Niveau 8 : K4 étendu (plus dense, nécessite réflexion)
            {
                name: "K4 étendu",
                nodes: [
                    {id: 0, x: -2, y: 2, z: 0},
                    {id: 1, x: 2, y: 2, z: 0},
                    {id: 2, x: 2, y: -2, z: 0},
                    {id: 3, x: -2, y: -2, z: 0},
                    {id: 4, x: 0, y: 0, z: 0},
                    {id: 5, x: 0, y: -3.5, z: 0}
                ],
                edges: [
                    [0,1],[0,2],[0,3],[1,2],[1,3],[2,3], // K4 among 0-3
                    [4,0],[4,1],[4,2],[4,3], // centre connected to all K4
                    [5,2],[5,3]
                ],
                minColors: 4
            },
            // Niveau 9 : Grille 3x3
            {
                name: "Grille 3x3",
                nodes: [
                    {id:0, x:-2, y:2, z:0},{id:1, x:0, y:2, z:0},{id:2, x:2, y:2, z:0},
                    {id:3, x:-2, y:0, z:0},{id:4, x:0, y:0, z:0},{id:5, x:2, y:0, z:0},
                    {id:6, x:-2, y:-2, z:0},{id:7, x:0, y:-2, z:0},{id:8, x:2, y:-2, z:0}
                ],
                edges: [
                    [0,1],[1,2],[3,4],[4,5],[6,7],[7,8],
                    [0,3],[1,4],[2,5],[3,6],[4,7],[5,8]
                ],
                minColors: 2
            },
            // Niveau 10 : Deux triangles reliés (complexité locale)
            {
                name: "Triangles reliés",
                nodes: [
                    {id:0, x:-3, y:1.5, z:0},{id:1, x:-1, y:1.5, z:0},{id:2, x:-2, y:-0.5, z:0},
                    {id:3, x:1, y:1.5, z:0},{id:4, x:3, y:1.5, z:0},{id:5, x:2, y:-0.5, z:0}
                ],
                edges: [
                    [0,1],[1,2],[2,0], // triangle gauche
                    [3,4],[4,5],[5,3], // triangle droite
                    [1,3],[2,5] // interconnexions
                ],
                minColors: 3
            }
        ];
    }

    loadLevel(levelIndex) {
        this.currentLevel = levelIndex;
        const level = this.levels[levelIndex];
        
        // Nettoyer l'ancien niveau
        this.clearLevel();
        
        // Créer les nœuds
        this.nodes = level.nodes.map(node => ({
            ...node,
            color: null
        }));
        
        this.edges = level.edges;
        
        // Créer les objets 3D
        this.createGraphObjects();
        
        // Mettre à jour l'UI
        this.updateUI();
        
        // Positionner la caméra
        this.camera.position.set(0, 0, 15);
        this.camera.lookAt(0, 0, 0);
    }

    createGraphObjects() {
        // Créer les arêtes (lignes)
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x666666,
            linewidth: 2
        });

        this.edges.forEach(edge => {
            const [i, j] = edge;
            const points = [
                new THREE.Vector3(this.nodes[i].x, this.nodes[i].y, this.nodes[i].z),
                new THREE.Vector3(this.nodes[j].x, this.nodes[j].y, this.nodes[j].z)
            ];
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            this.scene.add(line);
            this.edgeObjects.push(line);
        });

        // Créer les nœuds (sphères)
        const nodeGeometry = new THREE.SphereGeometry(0.4, 32, 32);
        
        this.nodes.forEach(node => {
            const material = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                emissive: 0x333333,
                metalness: 0.3,
                roughness: 0.7
            });
            
            const sphere = new THREE.Mesh(nodeGeometry, material);
            sphere.position.set(node.x, node.y, node.z);
            sphere.userData = { nodeId: node.id };
            
            this.scene.add(sphere);
            this.nodeObjects.push(sphere);
        });
    }

    clearLevel() {
        // Supprimer les arêtes
        this.edgeObjects.forEach(edge => this.scene.remove(edge));
        this.edgeObjects = [];
        
        // Supprimer les nœuds
        this.nodeObjects.forEach(node => this.scene.remove(node));
        this.nodeObjects = [];
        
        this.nodes = [];
        this.edges = [];
    }

    setupEventListeners() {
        // Clic sur la scène
        window.addEventListener('click', (event) => this.onMouseClick(event));
        
        // Mouvement de souris pour le hover
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    onMouseClick(event) {
        // Calculer la position de la souris relative au canvas renderer
        // Utiliser le boundingClientRect du canvas pour gérer les offsets (navbar, marges, etc.)
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Raycasting
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.nodeObjects);

        if (intersects.length > 0) {
            const clickedNode = intersects[0].object;
            const nodeId = clickedNode.userData.nodeId;
            
            // Gérer la sélection visuelle : désélectionner l'ancien si besoin
            if (this.selectedNode !== null && this.selectedNode !== undefined && this.selectedNode !== nodeId) {
                const prevObj = this.nodeObjects[this.selectedNode];
                if (prevObj) prevObj.scale.set(1,1,1);
            }
            // Marquer comme sélectionné
            this.selectedNode = nodeId;
            // Donner un retour visuel
            clickedNode.scale.set(1.2, 1.2, 1.2);

            // Colorier le nœud si une couleur a été choisie (permet recoloration en cliquant)
            if (this.currentColor !== null) {
                this.colorNode(nodeId, this.currentColor);
            }
            
            // Vérifier si la coloration est valide
            if (this.isColoringValid()) {
                this.showVictory();
            }
        }
    }

    onMouseMove(event) {
        // Calculer la position de la souris relative au canvas renderer
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.nodeObjects);

        // Reset tous les nœuds
        this.nodeObjects.forEach(obj => {
            obj.scale.set(1, 1, 1);
        });

        // Agrandir le nœud survolé
        if (intersects.length > 0) {
            intersects[0].object.scale.set(1.2, 1.2, 1.2);
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }
    }

    colorNode(nodeId, colorIndex) {
        // Supporter nodeId qui peut être un id ou un index
        const idx = this.nodes.findIndex(n => n.id === nodeId);
        const useIndex = idx !== -1 ? idx : nodeId;

        console.log('colorNode called', { nodeId, useIndex, colorIndex, colorsAvailable: this.colors.length });

        if (!this.nodes[useIndex] || !this.nodeObjects[useIndex]) {
            console.warn('Invalid node index', useIndex);
            return;
        }

        this.nodes[useIndex].color = colorIndex;
        try {
            const hex = this.colors[colorIndex];
            if (hex === undefined) {
                console.warn('Invalid color index', colorIndex);
            } else {
                this.nodeObjects[useIndex].material.color.setHex(hex);
                if (this.nodeObjects[useIndex].material.emissive) this.nodeObjects[useIndex].material.emissive.setHex(hex);
                this.nodeObjects[useIndex].material.emissiveIntensity = 0.3;
            }
        } catch (e) {
            console.error('Failed to set material color', e);
        }

        this.updateUI();
    }

    setCurrentColor(colorIndex) {
        this.currentColor = colorIndex;
        this.updateColorButtons();
    }

    updateColorButtons() {
        const buttons = document.querySelectorAll('.color-button');
        buttons.forEach((btn, index) => {
            if (this.currentColor !== null && index === this.currentColor) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    isColoringValid() {
        // Vérifier que tous les nœuds sont coloriés
        if (this.nodes.some(node => node.color === null)) {
            return false;
        }

        // Vérifier qu'aucune arête ne relie deux nœuds de même couleur
        for (const edge of this.edges) {
            const [i, j] = edge;
            if (this.nodes[i].color === this.nodes[j].color) {
                return false;
            }
        }

        return true;
    }

    showVictory() {
        const victoryMessage = document.getElementById('victory-message');
        const usedColors = new Set(this.nodes.map(n => n.color).filter(c => c !== null));
        
        document.getElementById('victory-text').innerHTML = `
            🎉 Niveau terminé !<br>
            Couleurs utilisées: ${usedColors.size}<br>
            Minimum possible: ${this.levels[this.currentLevel].minColors}
        `;
        
        victoryMessage.classList.add('show');
    }

    nextLevel() {
        const victoryMessage = document.getElementById('victory-message');
        victoryMessage.classList.remove('show');
        
        if (this.currentLevel < this.levels.length - 1) {
            this.loadLevel(this.currentLevel + 1);
        } else {
            alert("🎉 Félicitations ! Vous avez terminé tous les niveaux !");
            this.loadLevel(0);
        }
    }

    resetLevel() {
        this.loadLevel(this.currentLevel);
    }

    updateUI() {
        const level = this.levels[this.currentLevel];
        document.getElementById('level-name').textContent = level.name;
        document.getElementById('level-number').textContent = `${this.currentLevel + 1} / ${this.levels.length}`;
        
        const coloredNodes = this.nodes.filter(n => n.color !== null).length;
        document.getElementById('colored-nodes').textContent = `${coloredNodes} / ${this.nodes.length}`;
    }

    update() {
        // Animation légère des nœuds
        const time = Date.now() * 0.001;
        this.nodeObjects.forEach((node, index) => {
            node.position.y += Math.sin(time + index) * 0.002;
        });
    }
}
