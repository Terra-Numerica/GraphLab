// Imports
import { rgbToHex, findFreePositionX } from '../../../utils/colorUtils';
import { colors as colorPalette } from '../../../utils/colorPalette';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';

import ConfirmationPopup from '../../common/ConfirmationPopup';
import cytoscape from 'cytoscape';

const GraphDisplay = ({ graphData, cyRef, modeLibre = false, modeCreation = false, onAddEdge, onDeleteNode, onDeleteEdge, creationLibreMode = false, onColorNode }) => {
    const containerRef = useRef(null);
    const draggedColorRef = useRef(null);
    const closestNodeRef = useRef(null);
    const selectedColorNodeRef = useRef(null);
    const selectedNodeRef = useRef(null);
    const snapDistance = 50;
    const defaultColor = "#CCCCCC";
    const [deletePopup, setDeletePopup] = useState(null);
    const initialPositionsRef = useRef(null);

    useLayoutEffect(() => {
        if (cyRef.current && cyRef.current.container() === containerRef.current) {
            return;
        }

        if (cyRef.current) {
            cyRef.current.destroy();
            cyRef.current = null;
        }

        if (!graphData || !containerRef.current) return;

        let cy;
        // === MODE CREATION ===
        if (modeCreation) {
            cy = cytoscape({
                container: containerRef.current,
                elements: [
                    ...(graphData.nodes || []).map(node => ({
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
                            'shape': 'data(shape)'
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
                            'control-point-distance': 'data(controlPointDistance)',
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
                const nodes = (graphData.nodes || []).map(node => ({
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
                                'shape': 'data(shape)'
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
                                'control-point-distance': 'data(controlPointDistance)',
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
                const container = containerRef.current;
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
                const nodes = (graphData.data.nodes || []).map(node => ({
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
                                'shape': 'data(shape)'
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
                                'control-point-distance': 'data(controlPointDistance)',
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
            const minSpacing = pastilleSize + pastilleMargin;
            const spreadWidth = Math.min(width, minSpacing * (totalPastilles + 1));
            const startX = (width - spreadWidth) / 2;
            const spacing = spreadWidth / (totalPastilles + 1);
            let idx = 1;
            const yPosition = 50;
            if (graphData.tabletCounts) {
                Object.entries(graphData.tabletCounts).forEach(([color, count]) => {
                    for (let i = 0; i < count; i++) {
                        const x = startX + spacing * idx;
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
                        idx++;
                    }
                });
            }
            const elements = {
                nodes: [
                    ...(graphData.data?.nodes || []).map(node => ({
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
                            'shape': 'data(shape)'
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
                            'control-point-distance': 'data(controlPointDistance)',
                            'control-point-weight': 0.5
                        }
                    }
                ],
                layout: { name: 'preset' },
                zoomingEnabled: false,
                panningEnabled: false,
                boxSelectionEnabled: false
            });
        } else {
            // === MODE CREATION ===
            if (modeCreation) {
                cy = cytoscape({
                    container: containerRef.current,
                    elements: [
                        ...(graphData.nodes || []).map(node => ({
                            ...node,
                            data: {
                                ...node.data,
                                color: node.data.color || '#cccccc',
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
                            selector: 'edge',
                            style: {
                                'line-color': '#666',
                                'width': 2,
                                'curve-style': 'unbundled-bezier',
                                'control-point-distance': 'data(controlPointDistance)',
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
                if (creationLibreMode && graphData.pastilleCounts) {

                    const colorsToUse = Object.keys(graphData.pastilleCounts);
                    const nodes = (graphData.nodes || []).map(node => ({
                        ...node,
                        data: {
                            ...node.data,
                            color: node.data.color || '#cccccc',
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
                                selector: 'edge',
                                style: {
                                    'line-color': '#666',
                                    'width': 2,
                                    'curve-style': 'unbundled-bezier',
                                    'control-point-distance': 'data(controlPointDistance)',
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
                    const container = containerRef.current;
                    if (grapheHeight > container.clientHeight) {
                        container.style.height = `${grapheHeight}px`;
                    }

                    let xOffset = 50;
                    const yPosition = 50;
                    colorsToUse.forEach((color) => {
                        createInfiniteColorToken(color, xOffset, yPosition, cy, draggedColorRef);
                        xOffset += 50;
                    });

                } else if (graphData.pastilleCounts) {

                    const existingColors = Object.keys(graphData.pastilleCounts);
                    const availableColors = colorPalette.filter(c => !existingColors.includes(c));
                    const numRandomColors = Math.min(Math.floor(Math.random() * 3) + 1, availableColors.length);
                    const shuffled = [...availableColors].sort(() => 0.5 - Math.random());
                    const randomColors = shuffled.slice(0, numRandomColors);
                    const finalColors = existingColors.concat(randomColors);
                    const nodes = (graphData.data.nodes || []).map(node => ({
                        ...node,
                        data: {
                            ...node.data,
                            color: node.data.color || '#cccccc',
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
                                selector: 'edge',
                                style: {
                                    'line-color': '#666',
                                    'width': 2,
                                    'curve-style': 'unbundled-bezier',
                                    'control-point-distance': 'data(controlPointDistance)',
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
        }

        // --- DRAG & DROP LOGIC ---
        cy.on('grab', 'node', (evt) => {
            const node = evt.target;
            if (node.data('isColorNode')) {
                draggedColorRef.current = node.data('color');
                node.data('initialPosition', { x: node.position('x'), y: node.position('y') });
            }
        });

        cy.on('mousemove', (evt) => {
            if (draggedColorRef.current) {
                let closest = null;
                let minDistance = Infinity;
                cy.nodes().forEach((node) => {
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
                        closestNodeRef.current.style('border-color', '#666');
                    }
                    closestNodeRef.current = closest;
                    closest.style('border-color', '#FFD700');
                } else if (closestNodeRef.current) {
                    closestNodeRef.current.style('border-color', '#666');
                    closestNodeRef.current = null;
                }
            }
        });

        cy.on('free', 'node', (evt) => {
            const colorNode = evt.target;
            if (colorNode.data('isColorNode')) {
                if (modeLibre) {
                    cy.remove(colorNode);
                }
            }
            if (closestNodeRef.current && draggedColorRef.current) {
                const currentColor = closestNodeRef.current.data('color') || '#CCCCCC';
                if (currentColor !== '#CCCCCC') {
                    const initialPosition = colorNode.data('initialPosition');
                    if (initialPosition) colorNode.position(initialPosition);
                } else {
                    closestNodeRef.current.data('color', draggedColorRef.current);
                    closestNodeRef.current.style('border-color', '#666');
                    if (onColorNode) {
                        onColorNode(closestNodeRef.current.id(), draggedColorRef.current);
                    }
                    if (!modeLibre) {
                        cy.remove(colorNode);
                    }
                }
            } else {
                const initialPosition = colorNode.data('initialPosition');
                if (initialPosition && !modeLibre) colorNode.position(initialPosition);
            }
            draggedColorRef.current = null;
            if (closestNodeRef.current) {
                closestNodeRef.current.style('border-color', '#666');
                closestNodeRef.current = null;
            }
        });

        // --- CLICK TO SELECT/COLOR LOGIC ---
        cy.on('tap', 'node', (evt) => {
            const node = evt.target;

            if (modeCreation) {
                if (node.data('isColorNode')) {
                    if (selectedColorNodeRef.current && selectedColorNodeRef.current !== node) {
                        selectedColorNodeRef.current.style('border-color', '#000');
                    }
                    selectedColorNodeRef.current = node;
                    node.style('border-color', '#FFD700');
                } else if (selectedColorNodeRef.current) {
                    const currentColor = node.data('color');
                    if (currentColor === '#CCCCCC') {
                        node.data('color', selectedColorNodeRef.current.data('color'));
                        node.style('border-color', '#666');
                        if (onColorNode) {
                            onColorNode(node.id(), selectedColorNodeRef.current.data('color'));
                        }
                        cy.remove(selectedColorNodeRef.current);
                        selectedColorNodeRef.current = null;
                    } else {
                        selectedColorNodeRef.current.style('border-color', '#000');
                        selectedColorNodeRef.current = null;
                    }
                } else if (modeCreation) {
                    if (selectedNodeRef.current) {
                        if (selectedNodeRef.current === node) {
                            selectedNodeRef.current.style('border-color', '#666');
                            selectedNodeRef.current = null;
                        } else {
                            handleEdgeCreation(selectedNodeRef.current.id(), node.id());
                            selectedNodeRef.current.style('border-color', '#666');
                            selectedNodeRef.current = null;
                        }
                    } else {
                        selectedNodeRef.current = node;
                        node.style('border-color', '#FFD700');
                    }
                }
            }
        });

        cy.on('tap', (evt) => {
            if (evt.target === cy) {
                if (selectedNodeRef.current) {
                    selectedNodeRef.current.style('border-color', '#666');
                    selectedNodeRef.current = null;
                }
            }
        });

        // --- CLIC DROIT POUR SUPPRESSION ---
        cy.on('cxttap', 'node, edge', (evt) => {
            if (!modeCreation) return;
            evt.originalEvent.preventDefault();
            handleDeleteElement(evt.target);
        });

        // --- CLIC DROIT POUR RESET ---
        cy.on('cxttap', 'node', (evt) => {
            if (modeCreation) return;

            const node = evt.target;
            if (node.data('isColorNode')) return;
            
            const currentColor = node.data('color');
            if (currentColor === '#CCCCCC') return;
            
            node.data('color', '#CCCCCC');
            
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

        // Stocke les positions normalisées à l'initialisation du graphe
        if (cyRef.current && containerRef.current) {
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            initialPositionsRef.current = cyRef.current.nodes().map(node => ({
                id: node.id(),
                xNorm: node.position('x') / width,
                yNorm: node.position('y') / height
            }));
        }

        // Centre et scale le graphe (hors pastilles) à l'init
        centerAndScaleGraph();

        if (modeLibre) {
            cy.nodes().forEach(node => {
                if (!node.data('isColorNode')) {
                    node.lock();
                } else {
                    node.unlock();
                }
            });
        } else if (!modeCreation) {
            cy.nodes().forEach(node => {
                if (!node.data('isColorNode')) {
                    node.lock();
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

    // Fonction pour centrer et scaler le graphe (hors pastilles)
    function centerAndScaleGraph() {
        if (!cyRef.current || !containerRef.current) return;
        const cy = cyRef.current;
        const container = containerRef.current;
        const nodes = cy.nodes().filter(node => !node.data('isColorNode'));
        if (nodes.length === 0) return;
        // Bounding box du graphe
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        nodes.forEach(node => {
            const pos = node.position();
            if (pos.x < minX) minX = pos.x;
            if (pos.x > maxX) maxX = pos.x;
            if (pos.y < minY) minY = pos.y;
            if (pos.y > maxY) maxY = pos.y;
        });
        const graphWidth = maxX - minX;
        const graphHeight = maxY - minY;
        const margin = 40; // px, marge autour du graphe
        const availableWidth = container.clientWidth - margin * 2;
        const availableHeight = container.clientHeight - margin * 2 - 80; // 80px pour laisser la place aux pastilles
        const scale = Math.min(
            availableWidth / (graphWidth || 1),
            availableHeight / (graphHeight || 1),
            1.5 // ne pas trop agrandir
        );
        // Centre cible
        const centerX = container.clientWidth / 2;
        const centerY = (container.clientHeight + 80) / 2 + 30; // décale un peu vers le bas
        // Applique le scale et le centrage
        nodes.forEach(node => {
            const pos = node.position();
            node.position({
                x: centerX + (pos.x - (minX + graphWidth / 2)) * scale,
                y: centerY + (pos.y - (minY + graphHeight / 2)) * scale
            });
        });
    }

    // Handler de resize qui recalcule les positions
    function recalculateNodePositions() {
        if (cyRef.current && containerRef.current && initialPositionsRef.current) {
            cyRef.current.resize();
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            initialPositionsRef.current.forEach(pos => {
                const node = cyRef.current.getElementById(pos.id);
                if (node) {
                    node.position({
                        x: pos.xNorm * width,
                        y: pos.yNorm * height
                    });
                }
            });
            cyRef.current.fit();
        }
        // Centre et scale le graphe (hors pastilles)
        centerAndScaleGraph();
    }

    useEffect(() => {
        function handleResize() {
            recalculateNodePositions();
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!containerRef.current || !cyRef.current) return;
        const observer = new window.ResizeObserver(() => {
            recalculateNodePositions();
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [containerRef, cyRef]);

    const handleEdgeCreation = (sourceNode, targetNode) => {
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

    const handleDeleteElement = (element) => {
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
                className="mode-graph-area"
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
function createInfiniteColorToken(color, x, y, cy, draggedColorRef) {
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