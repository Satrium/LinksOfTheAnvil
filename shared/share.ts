import { Graph } from "./graph";
import { Preset } from "./graph.config";

export interface SharedGraphInfoResponse{
    url: string;
    graphInfo: SharedGraphInfo;
}

export interface SharedGraphInfo{
    id?: string;
    preset: string;
    world: string;
    owner?: string;
    authToken?: string;    
}

export interface SharedGraph{
    preset: Preset;
    graph: Graph;
}