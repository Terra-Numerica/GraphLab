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
                        'text-rotation': 'autorotate',
                        'text-margin-y': -10,
                        'color': '#000000',
                        'font-size': 14,
                        'font-weight': 'bold',
                        'text-background-color': '#FFFFFF',
                        'text-background-opacity': 0.7,
                        'text-background-padding': 2
                    }
                },
                {
                    selector: 'edge.selected',
                    style: {
                        'line-color': '#2ecc71',
                        'width': 3
                    }
                }
            ],
            layout: { name: 'preset' },
            zoomingEnabled: false,
            panningEnabled: false,
            boxSelectionEnabled: false
        });

        cyRef.current = cy;

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