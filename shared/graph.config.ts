import { DagMode, ElementVisibility, LinkColorScheme, NodeColorScheme } from "./graph.enum";

export class GraphConfigModel {
    showTags:boolean;
    addRootTag:boolean;
    nodes:NodeOptions;
    links?:LinkOptions;
    dagMode?:DagMode;
    visuals: VisualSettings;
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
    linkOpacity: number;
    nodeOpacity: number;
    nodeRelSize: number;
    textHeight: number;
}