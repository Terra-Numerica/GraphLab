// Imports
import { findFreePositionX } from '../../../utils/colorUtils';
import { colors as colorPalette } from '../../../utils/colorPalette';
import { useEffect, useRef, useState } from 'react';

import ConfirmationPopup from '../../common/ConfirmationPopup';
import cytoscape from 'cytoscape';

interface GraphDisplayProps {
    graphData: any;
    cyRef: any;
    modeLibre?: boolean;
    modeCreation?: boolean;
    onAddEdge?: any;
    onDeleteNode?: any;
    onDeleteEdge?: any;
    creationLibreMode?: boolean;
    onColorNode?: any;
}

const GraphDisplay: React.FC<GraphDisplayProps> = ({ 
    graphData, 
    cyRef, 
    modeLibre = false, 
    modeCreation = false, 
    onAddEdge, 
    onDeleteNode, 
    onDeleteEdge, 
    creationLibreMode = false, 
    onColorNode 
}) => {
    const containerRef = useRef(null);
    const draggedColorRef = useRef(null);
    const closestNodeRef = useRef(null);
    const selectedColorNodeRef = useRef(null);
    const selectedNodeRef = useRef(null);
    const snapDistance = 50;
    const [deletePopup, setDeletePopup] = useState<any>(null);

    useEffect(() => {
        if (cyRef.current && cyRef.current.container() === containerRef.current) {
            return;
        }

        if (cyRef.current) {
            cyRef.current.destroy();
            cyRef.current = null;
        }

        if (!graphData || !containerRef.current) return;

        let cy: cytoscape.Core | undefined;
        // === MODE CREATION ===
        if (modeCreation) {
            cy = cytoscape({
                container: containerRef.current,
                elements: [
                    ...(graphData.nodes || []).map((node: any) => ({
                        ...node,
                        data: {
                            ...node.data,
                            color: node.data.color || '#cccccc'
                        }
                    })),
                    ...(graphData.edges || [])
                ],
                style: [
                    {
                        selector: 'node',
                        style: {
                            'background-color': 'data(color)',
                            'border-width': 2,
                            'border-color': '#666'
                        }
                    },
                    {
                        selector: 'node[width]',
                        style: {
                            'width': 'data(width)'
                        }
                    },
                    {
                        selector: 'node[height]',
                        style: {
                            'height': 'data(height)'
                        }
                    },
                    {
                        selector: 'node[label]',
                        style: {
                            'label': ''
                        }
                    },
                    {
                        selector: 'node[shape]',
                        style: {
                            'shape': 'data(shape)' as any
                        }
                    },
                    {
                        selector: 'node[isColorNode]',
                        style: {
                            'width': 30,
                            'height': 30,
                            'label': '',
                            'border-width': 2,
                            'border-color': '#000',
                            'shape': 'ellipse'
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'line-color': '#666',
                            'width': 2,
                            'curve-style': 'unbundled-bezier',
                            'control-point-distance': 'data(controlPointDistance)' as any,
                            'control-point-weight': 0.5
                        }
                    }
                ],
                layout: { name: 'preset' },
                zoomingEnabled: false,
                panningEnabled: false,
                boxSelectionEnabled: false
            });
        }
        // === MODE LIBRE ===
        else if (modeLibre) {
            if (creationLibreMode && graphData.tabletCounts) {

                const colorsToUse = Object.keys(graphData.tabletCounts);
                const nodes = (graphData.nodes || []).map((node: any) => ({
                    ...node,
                    data: {
                        ...node.data,
                        color: node.data.color || '#cccccc'
                    }
                }));
                const edges = graphData.edges || [];

                cy = cytoscape({
                    container: containerRef.current,
                    elements: { nodes, edges },
                    style: [
                        {
                            selector: 'node',
                            style: {
                                'background-color': 'data(color)',
                                'border-width': 2,
                                'border-color': '#666'
                            }
                        },
                        {
                            selector: 'node[width]',
                            style: {
                                'width': 'data(width)'
                            }
                        },
                        {
                            selector: 'node[height]',
                            style: {
                                'height': 'data(height)'
                            }
                        },
                        {
                            selector: 'node[label]',
                            style: {
                                'label': ''
                            }
                        },
                        {
                            selector: 'node[shape]',
                            style: {
                                'shape': 'data(shape)' as any
                            }
                        },
                        {
                            selector: 'node[isColorNode]',
                            style: {
                                'width': 30,
                                'height': 30,
                                'label': '',
                                'border-width': 2,
                                'border-color': '#000',
                                'shape': 'ellipse'
                            }
                        },
                        {
                            selector: 'edge',
                            style: {
                                'line-color': '#666',
                                'width': 2,
                                'curve-style': 'unbundled-bezier',
                                'control-point-distance': 'data(controlPointDistance)' as any,
                                'control-point-weight': 0.5
                            }
                        }
                    ],
                    layout: { name: 'preset' },
                    zoomingEnabled: false,
                    panningEnabled: false,
                    boxSelectionEnabled: false
                });

                const minSafeY = 100;
                let minY = Infinity;
                let maxY = -Infinity;
                cy.nodes().forEach(node => {
                    if (!node.data('isColorNode')) {
                        const y = node.position('y');
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                });
                let offsetY = 0;
                if (minY < minSafeY) {
                    offsetY = minSafeY - minY;
                }
                cy.nodes().forEach(node => {
                    if (!node.data('isColorNode')) {
                        node.position({
                            x: node.position('x'),
                            y: node.position('y') + offsetY
                        });
                    }
                });
                const grapheHeight = maxY + offsetY + 100;
                const container = containerRef.current as HTMLElement;
                if (grapheHeight > container.clientHeight) {
                    container.style.height = `${grapheHeight}px`;
                }

                let xOffset = 50;
                const yPosition = 50;
                colorsToUse.forEach((color) => {
                    createInfiniteColorToken(color, xOffset, yPosition, cy, draggedColorRef);
                    xOffset += 50;
                });

            } else if (graphData.tabletCounts) {

                const existingColors = Object.keys(graphData.tabletCounts);
                const availableColors = colorPalette.filter(c => !existingColors.includes(c));
                const numRandomColors = Math.min(Math.floor(Math.random() * 3) + 1, availableColors.length);
                const shuffled = [...availableColors].sort(() => 0.5 - Math.random());
                const randomColors = shuffled.slice(0, numRandomColors);
                const finalColors = existingColors.concat(randomColors);
                const nodes = (graphData.data.nodes || []).map((node: any) => ({
                    ...node,
                    data: {
                        ...node.data,
                        color: node.data.color || '#CCCCCC'
                    }
                }));
                const edges = graphData.data.edges || [];

                cy = cytoscape({
                    container: containerRef.current,
                    elements: { nodes, edges },
                    style: [
                        {
                            selector: 'node',
                            style: {
                                'background-color': 'data(color)',
                                'border-width': 2,
                                'border-color': '#666'
                            }
                        },
                        {
                            selector: 'node[width]',
                            style: {
                                'width': 'data(width)'
                            }
                        },
                        {
                            selector: 'node[height]',
                            style: {
                                'height': 'data(height)'
                            }
                        },
                        {
                            selector: 'node[label]',
                            style: {
                                'label': ''
                            }
                        },
                        {
                            selector: 'node[shape]',
                            style: {
                                'shape': 'data(shape)' as any
                            }
                        },
                        {
                            selector: 'node[isColorNode]',
                            style: {
                                'width': 30,
                                'height': 30,
                                'label': '',
                                'border-width': 2,
                                'border-color': '#000',
                                'shape': 'ellipse'
                            }
                        },
                        {
                            selector: 'edge',
                            style: {
                                'line-color': '#666',
                                'width': 2,
                                'curve-style': 'unbundled-bezier',
                                'control-point-distance': 'data(controlPointDistance)' as any,
                                'control-point-weight': 0.5
                            }
                        }
                    ],
                    layout: { name: 'preset' },
                    zoomingEnabled: false,
                    panningEnabled: false,
                    boxSelectionEnabled: false
                });
                let xOffset = 50;
                const yPosition = 50;
                finalColors.forEach((color) => {
                    createInfiniteColorToken(color, xOffset, yPosition, cy, draggedColorRef);
                    xOffset += 50;
                });
            }
        }
        // === MODE DEFI ===
        else {
            const pastilleNodes: any[] = [];
            let xOffset = 50;
            const yPosition = 50;
            if (graphData.tabletCounts) {
                Object.entries(graphData.tabletCounts).forEach(([color, count]: [string, any]) => {
                    for (let i = 0; i < count; i++) {
                        pastilleNodes.push({
                            group: 'nodes',
                            data: { 
                                id: `color-${color}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, 
                                isColorNode: true,
                                color: color
                            },
                            position: { x: xOffset, y: yPosition },
                            locked: false
                        });
                        xOffset += 50;
                    }
                });
            }
            const elements = {
                nodes: [
                    ...(graphData.data?.nodes || []).map((node: any) => ({
                        ...node,
                        data: {
                            ...node.data,
                            color: node.data.color || '#CCCCCC'
                        }
                    })),
                    ...pastilleNodes
                ],
                edges: graphData.data?.edges || []
            };
            cy = cytoscape({
                container: containerRef.current,
                elements: elements,
                style: [
                    {
                        selector: 'node',
                        style: {
                            'background-color': 'data(color)',
                            'border-width': 2,
                            'border-color': '#666'
                        }
                    },
                    {
                        selector: 'node[width]',
                        style: {
                            'width': 'data(width)'
                        }
                    },
                    {
                        selector: 'node[height]',
                        style: {
                            'height': 'data(height)'
                        }
                    },
                    {
                        selector: 'node[label]',
                        style: {
                            'label': ''
                        }
                    },
                    {
                        selector: 'node[shape]',
                        style: {
                            'shape': 'data(shape)' as any
                        }
                    },
                    {
                        selector: 'node[isColorNode]',
                        style: {
                            'width': 30,
                            'height': 30,
                            'label': '',
                            'border-width': 2,
                            'border-color': '#000',
                            'shape': 'ellipse'
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'line-color': '#666',
                            'width': 2,
                            'curve-style': 'unbundled-bezier',
                            'control-point-distance': 'data(controlPointDistance)' as any,
                            'control-point-weight': 0.5
                        }
                    }
                ],
                layout: { name: 'preset' },
                zoomingEnabled: false,
                panningEnabled: false,
                boxSelectionEnabled: false
            });
        }

        // --- DRAG & DROP LOGIC ---
        if (!cy) return;
        cy.on('grab', 'node', (evt: any) => {
            const node = evt.target;
            if (node.data('isColorNode')) {
                draggedColorRef.current = node.data('color');
                node.data('initialPosition', { x: node.position('x'), y: node.position('y') });
            }
        });

        cy.on('mousemove', (evt: any) => {
            if (draggedColorRef.current) {
                let closest = null;
                let minDistance = Infinity;
                cy.nodes().forEach((node: any) => {
                    if (!node.data('isColorNode')) {
                        const distance = Math.sqrt(
                            Math.pow(node.position('x') - evt.position.x, 2) +
                            Math.pow(node.position('y') - evt.position.y, 2)
                        );
                        if (distance < minDistance && distance < snapDistance) {
                            minDistance = distance;
                            closest = node;
                        }
                    }
                });
                if (closest) {
                    if (closestNodeRef.current && closestNodeRef.current !== closest) {
                        (closestNodeRef.current as any).style('border-color', '#666');
                    }
                    closestNodeRef.current = closest;
                    (closest as any).style('border-color', '#FFD700');
                } else if (closestNodeRef.current) {
                    (closestNodeRef.current as any).style('border-color', '#666');
                    closestNodeRef.current = null;
                }
            }
        });

        cy.on('free', 'node', (evt: any) => {
            const colorNode = evt.target;
            if (colorNode.data('isColorNode')) {
                if (modeLibre) {
                    cy.remove(colorNode);
                }
            }
            if (closestNodeRef.current && draggedColorRef.current) {
                const currentColor = (closestNodeRef.current as any).data('color') || '#CCCCCC';
                if (currentColor !== '#CCCCCC') {
                    const initialPosition = (colorNode as any).data('initialPosition');
                    if (initialPosition) (colorNode as any).position(initialPosition);
                } else {
                    (closestNodeRef.current as any).data('color', draggedColorRef.current);
                    (closestNodeRef.current as any).style('border-color', '#666');
                    if (onColorNode) {
                        onColorNode((closestNodeRef.current as any).id(), draggedColorRef.current);
                    }
                    if (!modeLibre) {
                        cy.remove(colorNode);
                    }
                }
            } else {
                const initialPosition = (colorNode as any).data('initialPosition');
                if (initialPosition && !modeLibre) (colorNode as any).position(initialPosition);
            }
            draggedColorRef.current = null;
            if (closestNodeRef.current) {
                (closestNodeRef.current as any).style('border-color', '#666');
                closestNodeRef.current = null;
            }
        });

        // --- CLICK TO SELECT/COLOR LOGIC ---
        cy.on('tap', 'node', (evt: any) => {
            const node = evt.target;

            if (modeCreation) {
                if (node.data('isColorNode')) {
                    if (selectedColorNodeRef.current && selectedColorNodeRef.current !== node) {
                        (selectedColorNodeRef.current as any).style('border-color', '#000');
                    }
                    selectedColorNodeRef.current = node;
                    (node as any).style('border-color', '#FFD700');
                } else if (selectedColorNodeRef.current) {
                    const currentColor = (node as any).data('color');
                    if (currentColor === '#CCCCCC') {
                        (node as any).data('color', (selectedColorNodeRef.current as any).data('color'));
                        (node as any).style('border-color', '#666');
                        if (onColorNode) {
                            onColorNode((node as any).id(), (selectedColorNodeRef.current as any).data('color'));
                        }
                        cy.remove(selectedColorNodeRef.current);
                        selectedColorNodeRef.current = null;
                    } else {
                        (selectedColorNodeRef.current as any).style('border-color', '#000');
                        selectedColorNodeRef.current = null;
                    }
                } else if (modeCreation) {
                    if (selectedNodeRef.current) {
                        if (selectedNodeRef.current === node) {
                            (selectedNodeRef.current as any).style('border-color', '#666');
                            selectedNodeRef.current = null;
                        } else {
                            handleEdgeCreation((selectedNodeRef.current as any).id(), (node as any).id());
                            (selectedNodeRef.current as any).style('border-color', '#666');
                            selectedNodeRef.current = null;
                        }
                    } else {
                        selectedNodeRef.current = node;
                        (node as any).style('border-color', '#FFD700');
                    }
                }
            }
        });

        cy.on('tap', (evt: any) => {
            if (evt.target === cy) {
                if (selectedNodeRef.current) {
                    (selectedNodeRef.current as any).style('border-color', '#666');
                    selectedNodeRef.current = null;
                }
            }
        });

        // --- CLIC DROIT POUR SUPPRESSION ---
        cy.on('cxttap', 'node, edge', (evt: any) => {
            if (!modeCreation) return;
            evt.originalEvent.preventDefault();
            handleDeleteElement(evt.target);
        });

        // --- CLIC DROIT POUR RESET ---
        cy.on('cxttap', 'node', (evt: any) => {
            if (modeCreation) return;

            const node = evt.target;
            if ((node as any).data('isColorNode')) return;
            
            const currentColor = (node as any).data('color');
            if (currentColor === '#CCCCCC') return;
            
            (node as any).data('color', '#CCCCCC');
            
            if (!modeLibre) {
                const x = findFreePositionX(cy);
                if (x !== null) {
                    cy.add({
                        group: 'nodes',
                        data: { 
                            id: `color-${currentColor}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, 
                            isColorNode: true,
                            color: currentColor
                        },
                        position: { x, y: 50 },
                        locked: false
                    });
                }
            }
        });

        cyRef.current = cy;

        if (modeLibre) {
            cy.nodes().forEach((node: any) => {
                if (!(node as any).data('isColorNode')) {
                    (node as any).lock();
                } else {
                    (node as any).unlock();
                }
            });
        } else if (!modeCreation) {
            cy.nodes().forEach((node: any) => {
                if (!(node as any).data('isColorNode')) {
                    (node as any).lock();
                }
            });
        }

        return () => {
            if (cyRef.current) {
                cyRef.current.destroy();
                cyRef.current = null;
            }
        };
    }, [graphData, modeLibre, modeCreation, creationLibreMode]);

    const handleEdgeCreation = (sourceNode: any, targetNode: any): void => {
        if (sourceNode === targetNode) return;
        const newEdge = {
            data: {
                id: `e${sourceNode}-${targetNode}`,
                source: sourceNode,
                target: targetNode,
                controlPointDistance: 0
            }
        };
        if (onAddEdge) {
            onAddEdge(newEdge);
        }
    };

    const handleDeleteElement = (element: any): void => {
        if (element.isNode()) {
            setDeletePopup({
                title: "Suppression d'un sommet",
                message: "Es-tu sûr de vouloir supprimer ce sommet ? Toutes les arêtes connectées seront également supprimées.",
                onConfirm: () => {
                    if (onDeleteNode) {
                        onDeleteNode(element.id());
                    }
                    setDeletePopup(null);
                }
            });
        } else if (element.isEdge()) {
            setDeletePopup({
                title: "Suppression d'une arête",
                message: "Es-tu sûr de vouloir supprimer cette arête ?",
                onConfirm: () => {
                    if (onDeleteEdge) {
                        onDeleteEdge(element.id());
                    }
                    setDeletePopup(null);
                }
            });
        }
    };

    return (
        <>
            <div
                id="cy-predefined"
                className="workshop-graph-area"
                ref={containerRef}
            />
            {deletePopup && (
                <ConfirmationPopup
                    isOpen={true}
                    onClose={() => setDeletePopup(null)}
                    onConfirm={deletePopup.onConfirm}
                    title={deletePopup.title}
                    message={deletePopup.message}
                />
            )}
        </>
    );
}

/**
 * @description Crée une pastille infinie
 * @param {string} color - La couleur de la pastille
 * @param {number} x - La position x de la pastille
 * @param {number} y - La position y de la pastille
 * @param {cytoscape.Core} cy - Le graphique
 * @param {Object} draggedColorRef - La référence de la couleur glissée
 */
function createInfiniteColorToken(color: any, x: any, y: any, cy: any, draggedColorRef: any) {
    try {
        const token = cy.add({
            group: 'nodes',
            data: { 
                id: `color-${color}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, 
                isColorNode: true,
                color: color
            },
            position: { x, y },
            locked: false
        });

        if (token && typeof token.on === 'function') {
            token.on('grab', () => {
                draggedColorRef.current = color;
                createInfiniteColorToken(color, x, y, cy, draggedColorRef);
            });
        }

        return token;
    } catch (error) {
        console.error('Error creating infinite color token:', error);
        return null;
    }
}

export default GraphDisplay;