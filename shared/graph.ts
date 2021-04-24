export interface Graph{
    author: string;
    id: string;
    version: number;
    last_article_update: {[key:string]:string};
    last_update: Date;    
    links: GraphLink[];
    nodes: GraphNode[];
}

export interface GraphLink{
    group: string;
    label: string;
    source: string;
    target: string;
}

export interface GraphNode{
    id: string;
    name: string;
    group: string;
    link?: string;
    tags?: string[];
    draft?: boolean;
    wip?: boolean;
    public?: boolean;
    wordcount?: number;    
}