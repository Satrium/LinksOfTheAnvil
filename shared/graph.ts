import { ElementVisibility } from './graph.enum';

export interface Graph{
    worldname?: string;
    author: string;
    id: string;
    version: number;
    last_article_update: {[key:string]:string};
    last_update: Date;    
    links: GraphLink[];
    nodes: GraphNode[];
}

export interface GraphLink{
    type: string;
    label: string;
    source: string | GraphNode;
    target: string | GraphNode;

    // Display information
    visibility?: ElementVisibility;
}

export interface GraphNode{
    id: string;
    name: string;
    type: string;
    url?: string;
    tags?: string[];
    draft?: boolean;
    wip?: boolean;
    public?: boolean;
    wordcount?: number;    

    // Display information
    cluster?: string;
    x?: number;
    y?: number;
    z?: number;
    links?: any;
    neighbors?: GraphNode[];
    visibility?: ElementVisibility;
    color?: any;
    label?: any;
}