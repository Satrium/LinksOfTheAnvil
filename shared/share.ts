import { Graph } from "./graph";
import { Preset } from "./graph.config";
import { World } from "./worldanvil/world";

export interface SharedGraphInfoResponse{
    url: string;
    graphInfo: SharedGraphInfo;
}

export interface SharedGraphInfo{
    id?: string;
    preset: string;
    world: string;
    creationDate: Date;
    modificationDate: Date;
    owner?: string;
    authToken?: string;    
    presetInstance?: Preset;
    worldInstance?: World;
}

export interface SharedGraph{
    preset: Preset;
    graph: Graph;
}