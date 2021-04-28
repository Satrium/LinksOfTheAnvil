import { DagMode, DisplayMode, ElementVisibility, LinkColorScheme, NodeColorScheme } from "./graph.enum";
import { GraphConfig } from "./graph.object";

export interface Preset{
    id?: string;
    name: string;
    owner?: string;
    description?: string;
    img?: string;
    config?: GraphConfigModel | GraphConfig;    
}

export class GraphConfigModel {
    id?: string;
    name?: string;
    owner?: string;
    showTags:boolean;
    addRootTag:boolean;
    nodes?:NodeOptions;
    links?:LinkOptions;
    dagMode?:DagMode;
    visuals?: VisualSettings;
}

export interface NodeOptions{
    defaultVisibility: ElementVisibility;
    typeVisibility?: {[key:string]:ElementVisibility}
    displayNodesWithNoLinks?: boolean;
    colorScheme?:NodeColorScheme;
    displayDrafts?: boolean;
    displayWip?: boolean;
    displayPrivate?: boolean;
}

export interface LinkOptions{
    defaultVisibility: ElementVisibility;
    typeVisibility?: {[key:string]:ElementVisibility}
    colorScheme?:LinkColorScheme;  
}

export interface VisualSettings{
    linkOpacity?: number;
    nodeOpacity?: number;
    nodeRelSize?: number;
    textHeight?: number;
    displayMode?: DisplayMode
}