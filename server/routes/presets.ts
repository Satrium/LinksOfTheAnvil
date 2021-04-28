import { Preset } from '@global/graph.config';
import { ElementVisibility, NodeColorScheme, LinkColorScheme, DisplayMode } from '../../shared/graph.enum';


export const PRESETS:{[key:string]:Preset} = {
    "cluster": {
        id: "cluster",
        name: "Cluster",
        img: "cluster.png",      
        owner: "global",  
        description: "Find clusters of related articles in your world",
        config: {
            name: "cluster",            
            addRootTag: true,
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
        owner: "gloabl",
        img: "default.png"     
    }
}