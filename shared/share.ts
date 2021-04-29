import { Graph } from "./graph";
import { Preset } from "./graph.config";

export interface SharedGraphInfo{
    id: string;
    preset: string;
    world: string;
    authToken?: string;
}

export interface SharedGraph{
    preset: Preset;
    graph: Graph;
}