import { useEffect, useRef} from 'react';

import cytoscape from 'cytoscape';

const GraphDisplay = ({graphData, cyRef, selectableNodes, handleNextNode}) => {
    const containerRef = useRef(null);

    useEffect(() => {

        if (cyRef.current) {
            cyRef.current = null;
        }

        if (!graphData || !containerRef.current) return;

        const cy = cytoscape({
            container: containerRef.current,
            elements: {
                nodes : graphData.data.nodes,
                edges : graphData.data.edges
            },
            layout: { name: 'preset' },
            zoomingEnabled: true,
            panningEnabled: true,
            boxSelectionEnabled: false
        });

        cy.style().fromJson([
            {
                selector : 'node',
                style: {
                    'background-color': 'black',
                    "text-halign" : 'center',
                    "text-valign" : 'center',
                    "color" : 'white',
                    "font-family": "sans-serif",
                    'font-size': 12,
                    'width': 10,
                    'height': 10,
                }
            },
            {
                selector: 'edge',
                style: {
                    'line-color': '#333',
                    'width': 5,
                    'line-gradient-stop-positions': '20 45 55 80',
                }
            },
            {
                selector: ':selected',
                style: {
                    'background-color': 'SteelBlue',
                    'line-color': 'Steelblue',
                    'target-arrow-color': 'Steelblue',
                    'source-arrow-color': 'Steelblue'
                }
            },
            {
                selector: 'edge.RR',
                style: {
                    'line-fill': 'linear-gradient',
                    'line-gradient-stop-colors': ['orange', 'orange', 'black', 'orange', 'orange']
                }
            },
            {
                selector: 'edge.RB',
                style: {
                    'line-fill': 'linear-gradient',
                    'line-gradient-stop-colors': ['orange', 'orange', 'black', '#00AAFF', '#00AAFF'],
                }

            },
            {
                selector: 'edge.BR',
                style: {
                    'line-fill': 'linear-gradient',
                    'line-gradient-stop-colors': ['#00AAFF', '#00AAFF', 'black', 'orange', 'orange'],
                }
            },
            {
                selector: 'edge.BB',
                style: {
                    'line-fill': 'linear-gradient',
                    'line-gradient-stop-colors': ['#00AAFF', '#00AAFF', 'black', '#00AAFF', '#00AAFF'],
                }
            },
            {
                selector: 'edge.SOL',
                style: {
                    'line-color': 'yellow'
                }
            },
            {
                selector: 'node.A',
                style: {
                    "label" : 'A'
                }
            },
            {
                selector: 'node.B',
                style: {
                    "label" : 'B'
                }
            },
            {
                selector: 'node.selectable',
                style: {
                    'border-color': 'red',
                    'border-width': 3,
                    'border-opacity': 1
                }
            },
            {
                selector: 'node.selected',
                style: {
                    'border-color': 'lime',
                    'border-width': 3,
                    'border-opacity': 1
                }
            }
        ])

        cyRef.current = cy;

        cy.unbind('tap')

        cy.on('tap', 'node', (evt) => {
            const evtNode = evt.target;
            const evtNodeID = evtNode.id()
            console.log(evtNodeID)
            if (selectableNodes.includes(evtNodeID)) {
                handleNextNode(evtNodeID);
            }
        })

    }, [graphData, cyRef, selectableNodes, handleNextNode]);

    return (
        <>
            <div
                id="cy"
                className="mode-graph-area"
                ref={containerRef}
            />
        </>
    );
};

export default GraphDisplay;