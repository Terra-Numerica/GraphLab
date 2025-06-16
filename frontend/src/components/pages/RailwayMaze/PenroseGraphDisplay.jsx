import { useEffect, useRef} from 'react';

import cytoscape from 'cytoscape';

const GraphDisplay = ({ graphData, cyRef, onSelectNode }) => {
    const containerRef = useRef(null);

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
            }
        }));

        const edges = (graphData.data.edges || []).map(edge => ({
            ...edge,
            data: {
                ...edge.data,
            }
        }))

        const cy = cytoscape( {
            container: containerRef.current,
            elements: {
                nodes, edges
            },
            style: [
                {
                    selector : 'node',
                    style: {
                    }
                },
                {
                    selector: 'edge',
                    style: {

                    }
                },
                {
                    selector: 'edge.RR',
                    style: {

                    }
                },
                {
                    selector: 'edge.RB',
                    style: {

                    }
                },
                {
                    selector: 'edge.BR',
                    style: {

                    }
                },
                {
                    selector: 'edge.BB',
                    style: {

                    }
                },
                {
                    selector: 'edge.selectedOnce',
                    style: {

                    }
                },
                {
                    selector: 'edge.selectedTwice',
                    style: {

                    }
                }
            ],
            layout: { name: 'preset' },
            zoomingEnabled: false,
            panningEnabled: false,
            boxSelectionEnabled: false
            }
        );

        cyRef.current = cy;

        cy.on('tap', 'node', (evt) => {
            if (onSelectNode) {
                onSelectNode(evt.target);
            }
        });

    }, [graphData,cyRef,onSelectNode]);
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