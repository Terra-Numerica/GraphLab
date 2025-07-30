// Import
import { Schema, model } from 'mongoose';

const graphSchema = new Schema({
	name: { type: String, required: true, unique: [true,"Le nom du graphe doit être unique"] },
	data: {
		nodes: {
			type: [{ type: Object }],
			required: true,
			validate: {
				validator: (val : Object[]) =>  Array.isArray(val) && val.length > 0,
				message: 'Le champ "nodes" ne peut pas être vide.'
			}
		},
		edges: {
			type: [{ type: Object }],
			required: true,
			validate: {
				validator: (val : Object[]) => Array.isArray(val) && val.length > 0,
				message: 'Le champ "edges" ne peut pas être vide.'
			}
		}
	},
	tag: {
		type: [String],
		required: true,
		validate: {
			validator: (val : Object[]) => Array.isArray(val) && val.length > 0,
			message: 'Le champ "tag" ne peut pas être vide.'
		}
	},

	// Attributs coloration
	difficulty: {
		type: String,
		enum: ['Très facile', 'Facile', 'Moyen', 'Difficile', 'Impossible-preuve-facile', 'Impossible-preuve-difficile'],
		required: false
	},
	optimalColoring: { type: Number, required: false },
	pastilleCounts: { type: Object, required: false }


}, { timestamps: true });


// Export
export default model('Graph', graphSchema);