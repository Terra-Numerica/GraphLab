import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import ConfirmationPopup from '../../common/ConfirmationPopup';

const GraphDisplay = ({ graphData, cyRef, onSelectEdge }) => {
    
    const containerRef = useRef(null);
    const selectedEdgeRef = useRef(null);
    const [deletePopup, setDeletePopup] = useState(null);

    useEffect(() => {
        if (cyRef.current && cyRef.current.container() === containerRef.current) {
            return;
        }

        if (cyRef.current) {
            cyRef.current.destroy();
            cyRef.current = null;
        }

        if (!graphData || !containerRef.current) return;

        const nodes = (graphData.data.nodes || []).map(node => ({
            ...node,
            data: {
                ...node.data,
                color: '#cccccc',
            }
        }));
        const edges = (graphData.data.edges || []).map(edge => ({
            ...edge,
            data: {
                ...edge.data,
                weight: edge.data.weight || 0
            }
        }));

        const cy = cytoscape({
            container: containerRef.current,
            elements: { nodes, edges },
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#cccccc',
                        'width': 30,
                        'height': 30,
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'font-size': 12,
                        'label': 'data(label)',
                        'text-wrap': 'wrap'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'line-color': '#666',
                        'width': 2,
                        'curve-style': 'unbundled-bezier',
                        'control-point-distance': 'data(controlPointDistance)',
                        'control-point-weight': 0.5,
                        'label': 'data(weight)',
                        'text-halign': 'center',
                        'text-valign': 'center',
                        'text-margin-y': 'data(labelOffset)',
                        'color': '#222',
                        'font-size': 18,
                        'font-weight': 'bold',
                        'text-background-color': '#fff',
                        'text-background-opacity': 0.9,
                        'text-background-padding': 4,
                        'text-outline-color': '#fff',
                        'text-outline-width': 2,
                        'z-index': 1
                    }
                },
                {
                    selector: 'edge.selected',
                    style: {
                        'line-color': '#2ecc71',
                        'width': 3
                    }
                },
                {
                    selector: 'edge.hover',
                    style: {
                        'font-size': 26,
                        'text-background-color': '#ffe5b4',
                        'text-background-opacity': 1,
                        'z-index': 9999
                    }
                }
            ],
            layout: { name: 'preset' },
            zoomingEnabled: false,
            panningEnabled: false,
            boxSelectionEnabled: false
        });

        cyRef.current = cy;

        // Highlight edge and label on hover
        cy.on('mouseover', 'edge', (evt) => {
            evt.target.addClass('hover');
        });
        cy.on('mouseout', 'edge', (evt) => {
            evt.target.removeClass('hover');
        });

        return () => {
            if (cyRef.current) {
                cyRef.current.destroy();
                cyRef.current = null;
            }
        };
    }, [graphData, cyRef, onSelectEdge]);

    return (
        <>
            <div
                id="cy-predefined"
                className="mode-graph-area"
                ref={containerRef}
            />
        </>
    );
};

export default GraphDisplay; 