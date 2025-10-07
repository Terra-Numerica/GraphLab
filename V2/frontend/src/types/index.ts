// Types partagés pour l'application GraphLab V2

export interface Graph {
    _id: string;
    name: string;
    data: {
        nodes: Node[];
        edges: Edge[];
    };
    workshopData: {
        coloring?: {
            enabled: boolean;
            difficulty?: string;
            optimalCount?: number;
            tabletCounts?: Record<string, number>;
        };
        spanningTree?: {
            enabled: boolean;
        };
        railwayMaze?: {
            enabled: boolean;
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface Node {
    data: {
        id: string;
        label: string;
    };
    position: {
        x: number;
        y: number;
    };
    group: string;
    removed: boolean;
    selected: boolean;
    selectable: boolean;
    locked: boolean;
    grabbable: boolean;
    pannable: boolean;
    classes: string;
}

export interface Edge {
    data: {
        source: string;
        target: string;
        id: string;
        controlPointDistance: number;
        weight?: number;
    };
    position?: {
        x: number;
        y: number;
    };
}

export interface WorkshopConfig {
    coloring: {
        production: boolean;
        development: boolean;
    };
    spanningTree: {
        production: boolean;
        development: boolean;
    };
    railwayMaze: {
        production: boolean;
        development: boolean;
    };
}

export type WorkshopType = 'coloring' | 'spanningTree' | 'railwayMaze';

export interface GraphDisplayProps {
    graphData: Graph | null;
    cyRef: React.MutableRefObject<cytoscape.Core | null>;
    modeLibre?: boolean;
    selectableNodes?: string[];
    handleNextNode?: (nodeId: string) => void;
}

export interface TutorialStep {
    title: string;
    description: string;
    image: string;
    status: 'none' | 'yes' | 'no';
}

export interface TutorialPopupProps {
    steps: TutorialStep[];
    onClose: () => void;
    onComplete: (dontShowAgain: boolean) => void;
}

export interface ColorPalette {
    [key: string]: string;
}

export interface DifficultyColors {
    tresFacile: string;
    facile: string;
    moyen: string;
    difficile: string;
    extreme: string;
}

export interface AdminUser {
    id: string;
    username: string;
    role: string;
}

export interface LoginResponse {
    token: string;
    user: AdminUser;
}
