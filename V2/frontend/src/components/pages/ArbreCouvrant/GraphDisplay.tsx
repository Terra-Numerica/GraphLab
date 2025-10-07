import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { Graph } from '../../../types';

interface GraphDisplayProps {
    graphData: Graph;
    cyRef: React.MutableRefObject<cytoscape.Core | null>;
    onSelectEdge: (edge: cytoscape.EdgeSingular) => void;
}

const GraphDisplay: React.FC<GraphDisplayProps> = ({ graphData, cyRef, onSelectEdge }) => {

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (cyRef.current && cyRef.current.container() === containerRef.current) {
            return;
        }

        if (cyRef.current) {
            cyRef.current.destroy();
            cyRef.current = null;
        }

        if (!graphData || !containerRef.current) return;

        const nodes = (graphData.data.nodes || []).map((node) => ({
            ...node,
            data: {
                ...node.data,
                color: '#cccccc',
            },
            locked: true,
            group: 'nodes' as const
        }));

        const nodesMap: Record<string, { x: number; y: number }> = {};
        nodes.forEach((node) => {
            nodesMap[node.data.id] = node.position;
        });

        let edges = (graphData.data.edges || []).map((edge) => ({
            ...edge,
            data: {
                ...edge.data,
                weight: edge.data.weight || 0,
                controlPointDistance: edge.data.controlPointDistance ?? 0
            },
            group: 'edges' as const
        }));

        const edgeCount = edges.length;

        const crossingGroups: number[][] = [];
        for (let i = 0; i < edgeCount; i++) {
            let foundGroup: number[] | null = null;
            for (let j = 0; j < crossingGroups.length; j++) {
                if (crossingGroups[j].includes(i)) {
                    foundGroup = crossingGroups[j];
                    break;
                }
            }
            if (foundGroup) continue;

            const group: number[] = [i];
            for (let j = 0; j < edgeCount; j++) {
                if (i !== j && edgesCross(edges[i], edges[j], nodesMap)) {
                    group.push(j);
                }
            }

            if (group.length > 1) {
                const alreadyGrouped = group.some((idx: number) => crossingGroups.some((g: number[]) => g.includes(idx)));
                if (!alreadyGrouped) crossingGroups.push(group);
            }
        }

        const labelOffsets = new Array(edgeCount).fill(0);
        crossingGroups.forEach((group: number[]) => {
            const n = group.length;
            const baseOffset = 28;
            group.sort((a, b) => a - b);
            group.forEach((edgeIdx: number, idx: number) => {
                labelOffsets[edgeIdx] = baseOffset * (idx - (n - 1) / 2);
            });
        });

        edges = edges.map((edge, i: number) => ({
            ...edge,
            data: {
                ...edge.data,
                labelOffset: labelOffsets[i]
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
                        'width': 40,
                        'height': 40,
                        'border-width': 1,
                        'border-color': '#666',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'font-size': 15,
                        'label': 'data(label)',
                        'text-wrap': 'wrap'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'line-color': '#666',
                        'width': 3,
                        'curve-style': 'unbundled-bezier',
                        'control-point-distance': 'data(controlPointDistance)' as any,
                        'control-point-weight': 0.5,
                        'label': 'data(weight)',
                        'text-halign': 'center',
                        'text-valign': 'center',
                        'text-margin-y': 'data(labelOffset)' as any,
                        'color': '#222',
                        'font-size': 18,
                        'font-weight': 'bold',
                        'text-background-color': '#fff',
                        'text-background-opacity': 0.9,
                        'text-background-padding': 4 as any,
                        'text-outline-color': '#fff',
                        'text-outline-width': 2,
                        'z-index': 1 as any
                    }
                },
                {
                    selector: 'edge.selected',
                    style: {
                        // Une couleur plus flashy et pas rouge
                        'line-color': '#00AAFF',
                        'width': 6
                    }
                },
                {
                    selector: 'edge.hover',
                    style: {
                        'font-size': 26,
                        'line-color': '#ff0000',
                        'text-background-color': '#ff0000',
                        'text-background-opacity': 1,
                        'width': 6,
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

        cy.on('mouseover', 'edge', (evt) => {
            evt.target.addClass('hover');
        });
        cy.on('mouseout', 'edge', (evt) => {
            evt.target.removeClass('hover');
        });

        cy.on('tap', 'edge', (evt) => {
            if (onSelectEdge) {
                onSelectEdge(evt.target);
            }
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
                className="workshop-graph-area"
                ref={containerRef}
            />
        </>
    );
};

const edgesCross = (e1: { data: { source: string; target: string } }, e2: { data: { source: string; target: string } }, nodesMap: Record<string, { x: number; y: number }>): boolean => {
    const a1 = nodesMap[e1.data.source];
    const a2 = nodesMap[e1.data.target];
    const b1 = nodesMap[e2.data.source];
    const b2 = nodesMap[e2.data.target];
    if (!a1 || !a2 || !b1 || !b2) return false;

    if ([e1.data.source, e1.data.target].some(id => id === e2.data.source || id === e2.data.target)) return false;

    function orientation(p: { x: number; y: number }, q: { x: number; y: number }, r: { x: number; y: number }): number {
        const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (val === 0) return 0;
        return val > 0 ? 1 : 2;
    }

    function doIntersect(p1: { x: number; y: number }, q1: { x: number; y: number }, p2: { x: number; y: number }, q2: { x: number; y: number }): boolean {
        const o1 = orientation(p1, q1, p2);
        const o2 = orientation(p1, q1, q2);
        const o3 = orientation(p2, q2, p1);
        const o4 = orientation(p2, q2, q1);
        return o1 !== o2 && o3 !== o4;
    }
    return doIntersect(a1, a2, b1, b2);
}

export default GraphDisplay; 