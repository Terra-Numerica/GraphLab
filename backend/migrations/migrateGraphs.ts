import mongoose from 'mongoose';
import 'dotenv/config';

async function migrateGraphs() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("La variable d'environnement MONGODB_URI n'est pas définie");
        }
        await mongoose.connect(uri);
        console.log('Connecté à MongoDB');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('La connexion à MongoDB a échoué');
        }
        const graphsCollection = db.collection('graphs');

        const oldGraphs = await graphsCollection.find({}).toArray();
        console.log(`${oldGraphs.length} graphes trouvés à migrer`);

        for (const oldGraph of oldGraphs) {
            // Vérifie si le graphe a des données de coloration
            const hasColoringData = oldGraph.difficulty !== undefined || 
                                  oldGraph.optimalColoring !== undefined || 
                                  oldGraph.pastilleCounts !== undefined;

            const newGraph = {
                name: oldGraph.name,
                createdAt: oldGraph.createdAt,
                data: {
                    nodes: oldGraph.data.nodes.map((node: any) => ({
                        ...node,
                        group: node.group || 'nodes',
                        removed: node.removed || false,
                        selected: node.selected || false,
                        selectable: node.selectable !== undefined ? node.selectable : true,
                        locked: node.locked || false,
                        grabbable: node.grabbable !== undefined ? node.grabbable : true,
                        pannable: node.pannable || false,
                        classes: node.classes || ''
                    })),
                    edges: oldGraph.data.edges.map((edge: any) => ({
                        ...edge,
                        data: {
                            ...edge.data,
                            controlPointDistance: edge.data.controlPointDistance || 0
                        }
                    }))
                },
                workshopData: {
                    coloring: {
                        enabled: hasColoringData,
                        ...(hasColoringData ? {
                            difficulty: oldGraph.difficulty,
                            optimalCount: oldGraph.optimalColoring,
                            tabletCounts: oldGraph.pastilleCounts
                        } : {})
                    }
                }
            };

            await graphsCollection.updateOne(
                { _id: oldGraph._id },
                { 
                    $set: newGraph,
                    $unset: {
                        difficulty: "",
                        optimalColoring: "",
                        pastilleCounts: ""
                    }
                },
                { upsert: false }
            );

            console.log(`Graphe migré avec succès: ${oldGraph.name}`);
        }

        console.log('Migration terminée avec succès');
    } catch (error) {
        console.error('Erreur lors de la migration:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Déconnecté de MongoDB');
    }
}

migrateGraphs().catch(console.error); 