// Import
import { Schema, model } from 'mongoose';

// Schéma Workshop - Configuration des environnements pour chaque type d'atelier
const workshopSchema = new Schema({
	coloring: {
		production: {
			type: Boolean,
			default: false,
			required: true
		},
		development: {
			type: Boolean,
			default: false,
			required: true
		}
	},
	spanningTree: {
		production: {
			type: Boolean,
			default: false,
			required: true
		},
		development: {
			type: Boolean,
			default: false,
			required: true
		}
	},
	railwayMaze: {
		production: {
			type: Boolean,
			default: false,
			required: true
		},
		development: {
			type: Boolean,
			default: false,
			required: true
		}
	}
}, {
	timestamps: true,
	validateBeforeSave: true,
	strict: true
});

// Validation au niveau du schéma
workshopSchema.pre('save', function (next) {
	// Initialiser les champs manquants
	if (!this.coloring) {
		this.coloring = {
			production: false,
			development: false
		};
	}
	
	if (!this.spanningTree) {
		this.spanningTree = {
			production: false,
			development: false
		};
	}
	
	if (!this.railwayMaze) {
		this.railwayMaze = {
			production: false,
			development: false
		};
	}

	next();
});

// Hook post pour s'assurer que les documents retournés ont les champs requis
workshopSchema.post(['find', 'findOne', 'findOneAndUpdate'], function (docs) {
	if (!docs) return;
	
	const documents = Array.isArray(docs) ? docs : [docs];
	
	documents.forEach(doc => {
		if (doc) {
			// Initialiser les champs manquants
			if (!doc.coloring) {
				doc.coloring = {
					production: false,
					development: false
				};
			}
			
			if (!doc.spanningTree) {
				doc.spanningTree = {
					production: false,
					development: false
				};
			}
			
			if (!doc.railwayMaze) {
				doc.railwayMaze = {
					production: false,
					development: false
				};
			}
		}
	});
});

// Export
export default model('Workshop', workshopSchema);
