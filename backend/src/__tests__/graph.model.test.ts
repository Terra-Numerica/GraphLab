import mongoose from 'mongoose';
import { describe, beforeAll, afterAll, afterEach, it, expect } from '@jest/globals';
import Graph from '@/models/graph.model';

describe('Graph Model Test', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    afterEach(async () => {
        await Graph.deleteMany({});
    });

    // Exemple de graphe valide
    const validGraph = {
        name: "Graphe de test",
        data: {
            nodes: [
                {
                    data: {
                        id: "n1",
                        label: "n1"
                    },
                    position: {
                        x: 100,
                        y: 100
                    },
                    group: "nodes",
                    removed: false,
                    selected: false,
                    selectable: true,
                    locked: false,
                    grabbable: true,
                    pannable: false,
                    classes: ""
                },
                {
                    data: {
                        id: "n2",
                        label: "n2"
                    },
                    position: {
                        x: 200,
                        y: 200
                    },
                    group: "nodes",
                    removed: false,
                    selected: false,
                    selectable: true,
                    locked: false,
                    grabbable: true,
                    pannable: false,
                    classes: ""
                }
            ],
            edges: [
                {
                    data: {
                        source: "n1",
                        target: "n2",
                        id: "e1",
                        controlPointDistance: 0,
                        weight: 1
                    }
                }
            ]
        },
        workshopData: {
            coloring: {
                enabled: true,
                difficulty: "Facile",
                optimalCount: 2,
                tabletCounts: {
                    "rouge": 1,
                    "bleu": 1
                }
            }
        }
    };

    describe('Validation de graphe valide', () => {
        it('devrait créer un graphe valide avec succès', async () => {
            const graph = new Graph(validGraph);
            const savedGraph = await graph.save();
            expect(savedGraph._id).toBeDefined();
            expect(savedGraph.name).toBe(validGraph.name);
        });
    });

    describe('Validations de nom', () => {
        it('devrait échouer si le nom est trop court', async () => {
            const grapheNomCourt = { ...validGraph, name: "A" };
            const graph = new Graph(grapheNomCourt);
            
            await expect(graph.save()).rejects.toThrow(/Le nom doit contenir au moins 2 caractères/);
        });

        it('devrait échouer si le nom est trop long', async () => {
            const grapheNomLong = { ...validGraph, name: "A".repeat(51) };
            const graph = new Graph(grapheNomLong);
            
            await expect(graph.save()).rejects.toThrow(/Le nom ne peut pas dépasser 50 caractères/);
        });
    });

    describe('Validations des nœuds', () => {
        it('devrait échouer si un nœud manque un id', async () => {
            const grapheNoeudSansId = {
                ...validGraph,
                data: {
                    ...validGraph.data,
                    nodes: [
                        {
                            data: {
                                label: "n1"
                            },
                            position: { x: 100, y: 100 },
                            group: "nodes",
                            removed: false,
                            selected: false,
                            selectable: true,
                            locked: false,
                            grabbable: true,
                            pannable: false,
                            classes: ""
                        }
                    ]
                }
            };
            const graph = new Graph(grapheNoeudSansId);
            
            await expect(graph.save()).rejects.toThrow(/Structure de nœud invalide/);
        });

        it('devrait échouer si la position est invalide', async () => {
            const graphePositionInvalide = {
                ...validGraph,
                data: {
                    ...validGraph.data,
                    nodes: [
                        {
                            data: { id: "n1", label: "n1" },
                            position: { x: "100", y: 100 },
                            group: "nodes",
                            removed: false,
                            selected: false,
                            selectable: true,
                            locked: false,
                            grabbable: true,
                            pannable: false,
                            classes: ""
                        }
                    ]
                }
            };
            const graph = new Graph(graphePositionInvalide);
            
            await expect(graph.save()).rejects.toThrow(/Structure de nœud invalide/);
        });
    });

    describe('Validations des arêtes', () => {
        it('devrait échouer si une arête référence un nœud inexistant', async () => {
            const grapheAreteInvalide = {
                ...validGraph,
                data: {
                    ...validGraph.data,
                    edges: [
                        {
                            data: {
                                source: "n1",
                                target: "n3",
                                id: "e1",
                                controlPointDistance: 0
                            }
                        }
                    ]
                }
            };
            const graph = new Graph(grapheAreteInvalide);
            
            await expect(graph.save()).rejects.toThrow(/Les arêtes référencent des nœuds qui n'existent pas/);
        });

        it("devrait échouer si le poids n'est pas un nombre", async () => {
            const graphePoidInvalide = {
                ...validGraph,
                data: {
                    ...validGraph.data,
                    edges: [
                        {
                            data: {
                                source: "n1",
                                target: "n2",
                                id: "e1",
                                controlPointDistance: 0,
                                weight: "1"
                            }
                        }
                    ]
                }
            };
            const graph = new Graph(graphePoidInvalide);
            
            await expect(graph.save()).rejects.toThrow(/Structure d'arête invalide/);
        });
    });

    describe("Validations des données d'atelier", () => {
        it('devrait échouer si la difficulté est invalide', async () => {
            const grapheDifficulteInvalide = {
                ...validGraph,
                workshopData: {
                    ...validGraph.workshopData,
                    coloring: {
                        ...validGraph.workshopData.coloring,
                        difficulty: "Impossible"
                    }
                }
            };
            const graph = new Graph(grapheDifficulteInvalide);
            
            await expect(graph.save()).rejects.toThrow(/n'est pas un niveau de difficulté valide/);
        });

        it("devrait échouer si le nombre optimal de couleurs n'est pas un entier positif", async () => {
            const grapheOptimalInvalide = {
                ...validGraph,
                workshopData: {
                    ...validGraph.workshopData,
                    coloring: {
                        ...validGraph.workshopData.coloring,
                        optimalCount: 0
                    }
                }
            };
            const graph = new Graph(grapheOptimalInvalide);
            
            await expect(graph.save()).rejects.toThrow(/Le nombre optimal de couleurs doit être au moins 1/);
        });

        it('devrait échouer si les compteurs de pastilles ne sont pas des entiers positifs', async () => {
            const graphePastillesInvalides = {
                ...validGraph,
                workshopData: {
                    ...validGraph.workshopData,
                    coloring: {
                        ...validGraph.workshopData.coloring,
                        tabletCounts: {
                            "rouge": -1
                        }
                    }
                }
            };
            const graph = new Graph(graphePastillesInvalides);
            
            await expect(graph.save()).rejects.toThrow(/Les comptes de pastilles doivent être des nombres entiers positifs/);
        });
    });
}); 