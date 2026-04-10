# 🎨 Jeu de Coloration de Graphes - Terra Numerica

Jeu éducatif de coloration de graphes adapté du projet Scratch original.

---

## 🌐 Version en ligne
Vous pouvez tester le jeu directement dans votre navigateur ici :  
👉 **[https://terra-numerica.github.io/GraphLab/](https://terra-numerica.github.io/GraphLab/)**

---

## 🚀 Démarrage rapide

### 1️⃣ Extraction
```bash
unzip graph-coloring-game.zip
cd graph-coloring-game
```

### 2️⃣ Installation
```bash
npm install
```

### 3️⃣ Lancement
```bash
npm run dev
```

Le jeu s'ouvrira automatiquement dans votre navigateur à : **http://localhost:5173**

---

## 🎮 Comment jouer

### Objectif
Coloriez tous les nœuds du graphe en respectant **une seule règle** :
> **Deux nœuds reliés par une arête ne peuvent pas avoir la même couleur.**

### Contrôles
1. **Sélectionnez une couleur** dans la palette à gauche (rouge, bleu, vert, jaune)
2. **Cliquez sur un nœud** pour le colorier avec la couleur sélectionnée
3. **Essayez d'utiliser le minimum de couleurs possible !**

### Interface
- **Palette (gauche)** : Choisir la couleur active
- **Informations (droite)** : Niveau, graphe, progression
- **Bannière (haut)** : Règles et choix de niveau
- **Boutons (bas)** : Recommencer ou passer au niveau suivant

---

## 📊 Les 5 niveaux

1. **Triangle** - 3 couleurs minimum
2. **Carré** - 2 couleurs minimum  
3. **Pentagone** - 3 couleurs minimum
4. **Tétraèdre (K4)** - 4 couleurs minimum
5. **Biparti** - 2 couleurs minimum

---

## 🧠 Concept pédagogique

Ce jeu illustre le **problème de coloration de graphes**, un concept fondamental en théorie des graphes et en informatique.

### Applications réelles
- **Planification d'horaires** (cours, examens)
- **Attribution de fréquences** (télécommunications)
- **Registres de processeurs** (compilation)
- **Cartographie** (coloration de cartes géographiques)

Le nombre minimum de couleurs nécessaires pour colorier un graphe s'appelle le **nombre chromatique**.

---

## 🛠️ Technologies utilisées

- **Three.js** - Rendu 3D
- **Framework Terra Numerica** - Interface et navigation
- **Vite** - Build tool
- **JavaScript ES6+**

---

## 📁 Structure du projet

```
graph-coloring-game/
├── framework/           # Framework Terra Numerica
├── src/
│   ├── js/
│   │   ├── main.js     # Point d'entrée + UI
│   │   └── game.js     # Logique du jeu
│   └── css/
│       └── game.css    # Styles
├── index.html          # Page principale
├── package.json        # Dépendances
└── vite.config.js      # Configuration Vite
```

---

## 🎯 Fonctionnalités

✅ 5 niveaux de difficulté croissante  
✅ 4 couleurs disponibles  
✅ Validation automatique de la coloration  
✅ Interface intuitive avec hover effect  
✅ Framework Terra Numerica intégré  
✅ Animations fluides  
✅ Responsive design  

---

## 🔧 Dépannage

### Le jeu ne se lance pas
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erreur de port
Si le port 5173 est occupé, éditez `vite.config.js` et changez le port.

---

## 📝 Crédits

- **Jeu original** : Projet Scratch "Jeu de coloration"
- **Adaptation** : Version Three.js pour Terra Numerica
- **Framework** : Terra Numerica

---

**Bon jeu ! 🎮🧠**
