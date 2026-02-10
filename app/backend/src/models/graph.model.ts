// Import
import { Schema, model } from 'mongoose';

// Types pour la validation
interface NodeData {
	id: string;
	label: string;
}

interface Node {
	data: NodeData;
	position: { x: number; y: number };
	group: string;
	removed: boolean;
	selected: boolean;
	selectable: boolean;
	locked: boolean;
	grabbable: boolean;
	pannable: boolean;
	classes: string;
}

interface EdgeData {
	source: string;
	target: string;
	id: string;
	controlPointDistance: number;
	weight?: number;
}

interface Edge {
	data: EdgeData;
	position?: { x: number; y: number };
}

const graphSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Le nom du graphe est requis'],
		trim: true,
		minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
		maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	data: {
		nodes: {
			type: Array,
			required: [true, 'Les nœuds du graphe sont requis'],
			validate: {
				validator: function (nodes: Node[]) {
					return nodes.every(node => {
						// Validation de la structure du nœud
						const hasValidData = node.data &&
							typeof node.data.id === 'string' &&
							typeof node.data.label === 'string';

						// Validation de la position
						const hasValidPosition = node.position &&
							typeof node.position.x === 'number' &&
							typeof node.position.y === 'number';

						// Validation des propriétés booléennes
						const hasValidProperties =
							typeof node.removed === 'boolean' &&
							typeof node.selected === 'boolean' &&
							typeof node.selectable === 'boolean' &&
							typeof node.locked === 'boolean' &&
							typeof node.grabbable === 'boolean' &&
							typeof node.pannable === 'boolean';

						// Validation du groupe et des classes
						const hasValidGroupAndClasses =
							typeof node.group === 'string' &&
							typeof node.classes === 'string';

						return hasValidData && hasValidPosition &&
							hasValidProperties && hasValidGroupAndClasses;
					});
				},
				message: 'Structure de nœud invalide'
			}
		},
		edges: {
			type: Array,
			required: [true, 'Les arêtes du graphe sont requises'],
			validate: {
				validator: function (edges: Edge[]) {
					return edges.every(edge => {
						// Validation des données de l'arête
						const hasValidData = edge.data &&
							typeof edge.data.source === 'string' &&
							typeof edge.data.target === 'string' &&
							typeof edge.data.id === 'string' &&
							typeof edge.data.controlPointDistance === 'number';

						// Validation du poids (optionnel)
						const hasValidWeight = !edge.data.weight ||
							typeof edge.data.weight === 'number';

						// Validation de la position (optionnelle)
						const hasValidPosition = !edge.position || (
							typeof edge.position.x === 'number' &&
							typeof edge.position.y === 'number'
						);

						return hasValidData && hasValidWeight && hasValidPosition;
					});
				},
				message: "Structure d'arête invalide"
			}
		}
	},
	workshopData: {
		coloring: {
			enabled: {
				type: Boolean,
				default: false,
				required: true
			},
			difficulty: {
				type: String,
				enum: {
					values: ['Très facile', 'Facile', 'Moyen', 'Difficile', 'Impossible-preuve-facile', 'Impossible-preuve-difficile'],
					message: "{VALUE} n'est pas un niveau de difficulté valide"
				},
				required: [function (this: { workshopData?: { coloring?: { enabled?: boolean } } }) {
					return this.workshopData?.coloring?.enabled;
				}, 'Le niveau de difficulté est requis quand la coloration est activée']
			},
			optimalCount: {
				type: Number,
				required: [function (this: { workshopData?: { coloring?: { enabled?: boolean } } }) {
					return this.workshopData?.coloring?.enabled;
				}, 'Le nombre optimal de couleurs est requis quand la coloration est activée'],
				min: [1, 'Le nombre optimal de couleurs doit être au moins 1'],
				validate: {
					validator: Number.isInteger,
					message: 'Le nombre optimal de couleurs doit être un entier'
				}
			},
			tabletCounts: {
				type: Object,
				required: [function (this: { workshopData?: { coloring?: { enabled?: boolean } } }) {
					return this.workshopData?.coloring?.enabled;
				}, 'Le compte des pastilles est requis quand la coloration est activée'],
				validate: {
					validator: function (this: { workshopData?: { coloring?: { enabled?: boolean } } }, counts: Record<string, number>) {
						if (!this.workshopData?.coloring?.enabled) return true;
						return Object.values(counts).every(count =>
							typeof count === 'number' &&
							count >= 0 &&
							Number.isInteger(count)
						);
					},
					message: 'Les comptes de pastilles doivent être des nombres entiers positifs'
				}
			}
		},
		spanningTree: {
			enabled: {
				type: Boolean,
				default: false,
				required: true
			}
		},
		railwayMaze: {
			enabled: {
				type: Boolean,
				default: false,
				required: true
			}
		}
	}
}, {
	timestamps: true,
	// Ajouter des options pour une meilleure gestion des erreurs
	validateBeforeSave: true,
	// Supprimer les champs undefined lors de la sauvegarde
	strict: true
});

// Validation au niveau du schéma
graphSchema.pre('save', function (next) {
	// Initialiser les champs workshopData manquants pour les documents existants
	if (!this.workshopData) {
		this.workshopData = {};
	}
	
	// Initialiser spanningTree si manquant
	if (!this.workshopData.spanningTree) {
		this.workshopData.spanningTree = {
			enabled: false
		};
	}
	
	// Initialiser railwayMaze si manquant
	if (!this.workshopData.railwayMaze) {
		this.workshopData.railwayMaze = {
			enabled: false
		};
	}
	
	// Initialiser coloring si manquant
	if (!this.workshopData.coloring) {
		this.workshopData.coloring = {
			enabled: false
		};
	}

	// Vérifier que les nœuds référencés dans les arêtes existent
	if (this.data && this.data.nodes && this.data.edges) {
		const nodeIds = new Set(this.data.nodes.map((node: Node) => node.data.id));
		const edgesValid = this.data.edges.every((edge: Edge) =>
			nodeIds.has(edge.data.source) && nodeIds.has(edge.data.target)
		);

		if (!edgesValid) {
			next(new Error("Les arêtes référencent des nœuds qui n'existent pas"));
		}

		// Vérifier que le graphe n'est pas vide
		if (this.data.nodes.length === 0) {
			next(new Error('Le graphe doit contenir au moins un nœud'));
		}
	}

	next();
});

// Hook pour initialiser les champs manquants lors de la récupération des documents
graphSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function (next) {
	// Cette fonction sera appelée pour chaque document retourné
	next();
});

// Hook post pour s'assurer que les documents retournés ont les champs requis
graphSchema.post(['find', 'findOne', 'findOneAndUpdate'], function (docs) {
	if (!docs) return;
	
	const documents = Array.isArray(docs) ? docs : [docs];
	
	documents.forEach(doc => {
		if (doc) {
			// Initialiser workshopData si manquant
			if (!doc.workshopData) {
				doc.workshopData = {};
			}
			
			// Initialiser spanningTree si manquant
			if (!doc.workshopData.spanningTree) {
				doc.workshopData.spanningTree = {
					enabled: false
				};
			}
			
			// Initialiser railwayMaze si manquant
			if (!doc.workshopData.railwayMaze) {
				doc.workshopData.railwayMaze = {
					enabled: false
				};
			}
			
			// Initialiser coloring si manquant
			if (!doc.workshopData.coloring) {
				doc.workshopData.coloring = {
					enabled: false
				};
			}
		}
	});
});

// Export
export default model('Graph', graphSchema);
