import { GraphConfigModel } from '@global/graph.config';
import { ElementVisibility, NodeColorScheme, LinkColorScheme } from '../../shared/graph.enum';

export interface Preset{
    id: string;
    name: string;
    description: string;
    img?: string;
    config?: GraphConfigModel;
}

export const PRESETS:{[key:string]:Preset} = {
    "cluster": {
        id: "cluster",
        name: "Cluster",
        img: "cluster.png",
        description: "Find clusters of related articles in your world",
        config: {
            id: "cluster",
            addRootTag: false,
            showTags: true,
            nodes: {
                colorScheme: NodeColorScheme.CLUSTER,
                defaultVisibility: ElementVisibility.ON
            },
            links:{
                colorScheme: LinkColorScheme.SOURCE,
                defaultVisibility: ElementVisibility.ON
            }
        }
    }, "default": {
        id: "default",
        name: "Articles & Connections",
        description: "Get an overview of articles and connections in your world",
        img: "default.png"     
    }
}