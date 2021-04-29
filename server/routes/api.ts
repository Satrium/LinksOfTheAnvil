import { Router, Request } from 'express';
import { User } from '@global/worldanvil/user';
import { Graph } from '@global/graph';
import * as asyncRedis from 'async-redis';
import * as r from 'rethinkdb';
import { WorldAnvil } from '../worldanvil';
import { generateGraph, updateGraph } from '../graph';
import { GraphConfigModel, Preset } from '@global/graph.config';
import { PRESETS } from './presets';
import { v4 as uuidv4 } from 'uuid'

import * as presetSchema from '../schema/preset.schema.json';
import {validate} from 'jsonschema';
import config from '../config';

console.log(config.get("port"));
export const apiRouter = Router();
const redis = asyncRedis.createClient({host: config.get("redis.host"), port: config.get("redis.port")});

const DATA_VERSION = 2;
const RETHINK_DB = {
    "host": config.get("rethinkdb.host"), 
    "port": config.get("rethinkdb.port"), 
    "db": config.get("rethinkdb.db")
}

export type CustomRequest = Request & {userToken: string; user: User;}

const auth = async (req:CustomRequest, res, next) => {
    if(req.header("x-auth-token")){
        req.userToken = req.header("x-auth-token");
        let cache = await redis.get("user." + req.userToken);
        if(cache != null){
            req.user = JSON.parse(cache) as User
            next();
        }else{
            try{
                let currentUser = await (req.app.get("WA") as WorldAnvil).getCurrentUser(req.userToken);
                if(currentUser){
                    let user = await (req.app.get("WA") as WorldAnvil).getUser(req.userToken, currentUser.id);
                    await redis.set("user." + req.userToken, JSON.stringify(user));
                    next();
                }
            }catch(e){
                res.status(401)
                console.error(e);
                res.send();
            }            
        }
    }else{
        return res.status(401);
    }
}

apiRouter.get('/auth', auth, (req:CustomRequest,res) => {
    res.json(req.user);
});

apiRouter.get('/user/worlds', auth, async (req:CustomRequest, res) => {
    let worlds = await (req.app.get("WA") as WorldAnvil).getUserWorlds(req.userToken, req.user.id);
    return res.json(worlds);
});

apiRouter.get('/world/:id', auth, async (req:CustomRequest, res) => {
    let con = await r.connect(RETHINK_DB);
    let graph = await r.table("worlds").get(req.params.id).run(con) as Graph;
    if(graph){
        if(graph.author !== req.user.id)return res.status(403);
        // Trigger full load again
        else if(graph.version != DATA_VERSION){
            graph = await generateGraph(req.app.get("WA") as WorldAnvil, req.userToken,req.user,req.params.id);    
            await r.table('worlds').update(graph).run(con);
            res.json(graph);  
        }
        // Return cache
        else if(new Date().getTime() - new Date(graph.last_update).getTime() < 1000) return res.json(graph);
        else{
            // Update Graph
            graph = await updateGraph(graph,req.app.get("WA") as WorldAnvil,req.userToken);
            await r.table('worlds').update(graph).run(con);
            res.json(graph);
        }
        
    }else{
        // Trigger full load
        graph = await generateGraph(req.app.get("WA") as WorldAnvil, req.userToken,req.user,req.params.id);
        console.log(graph.nodes.filter(x => !x.url));
        await r.table('worlds').insert(graph).run(con);
        res.json(graph);        
    }
});

/** Global Presets */
apiRouter.get("/preset", auth, async (req:CustomRequest, res) => {
    let con = await r.connect(RETHINK_DB);
    let presets = await (await r.table("presets").filter({owner: req.user.id}).run(con)).toArray() as Preset[];
    console.log(presets);
    return res.json(Object.values(PRESETS).concat(presets).map(x => { const {config, ...value} = x; return value}));
});

apiRouter.post("/preset", auth, async (req:CustomRequest, res) => {
    let con = await r.connect(RETHINK_DB);
    let presetCount = await r.table("presets").filter({owner: req.user.id}).count().run(con);
    console.log(!req.body.id, validate(req.body, presetSchema));
    if(req.body && validate(req.body, presetSchema).valid && req.body.config && !req.body.id){
        let preset = req.body as Preset;
        preset.owner = req.user.id;
        preset.id = uuidv4();
        preset = parsePreset(preset);
        await r.table("presets").insert(preset).run(con);
        return res.status(201).json(preset).send();
    }else{
        return res.status(400).send();
    }
});

function parsePreset(preset:Preset):Preset{
    // Node Visibility
    if(preset?.config?.nodes?.typeVisibility && Object.keys(preset?.config?.nodes?.typeVisibility).length > 0){
        let counter:{[key:number]: number} = {}
        for(const [key, value] of Object.entries(preset?.config?.nodes?.typeVisibility)){
            if(!(value in counter))counter[value] = 1;
            else counter[value]++;
        }
        let type = parseInt(Object.keys(counter).sort((a,b) => counter[b] - counter[a])[0]);
        preset.config.nodes.defaultVisibility = type;
        for(const [key, value] of Object.entries(preset?.config?.nodes?.typeVisibility))
            if(value === type)delete preset.config.nodes.typeVisibility[key];
        console.log(counter, type);
    }

    // Type visibility
    if(preset?.config?.links?.typeVisibility && Object.keys(preset?.config?.links?.typeVisibility).length > 0){
        let counter:{[key:number]: number} = {}
        for(const [key, value] of Object.entries(preset?.config?.links?.typeVisibility)){
            if(!(value in counter))counter[value] = 1;
            else counter[value]++;
        }
        let type = parseInt(Object.keys(counter).sort((a,b) => counter[b] - counter[a])[0]);
        preset.config.links.defaultVisibility = type;
        for(const [key, value] of Object.entries(preset?.config?.links?.typeVisibility))
            if(value === type)delete preset.config.links.typeVisibility[key];
        console.log(counter, type);
    }
    return preset;
}

apiRouter.put("/preset/:id", auth, async (req:CustomRequest, res) => {
    if(req.body && validate(req.body, presetSchema).valid && req.body.config && req.body.id === req.params.id){
        let preset = req.body as Preset;
        let con = await r.connect(RETHINK_DB);
        let oldPreset = await r.table("presets").get(req.params.id).run(con);
        if(!oldPreset) return res.status(404).send();
        if(oldPreset.owner !== req.user.id) return res.status(401).send();
        preset.owner = req.user.id;
        preset = parsePreset(preset);
        await r.table("presets").insert(preset, {conflict:"replace"}).run(con);
        return res.status(201).json(preset).send();
    }else{
        return res.status(400).send();
    }
})

apiRouter.delete("/preset/:id", auth, async (req:CustomRequest, res) => {    
    let con = await r.connect(RETHINK_DB);
    let preset = await r.table("presets").get(req.params.id).run(con) as GraphConfigModel;

    if(preset && preset.owner === req.user.id){
        await r.table("presets").get(req.params.id).delete().run(con);
        return res.status(200).send();
    }else{
        return res.status(404).send();
    }    
});

apiRouter.get("/preset/:id", auth, async (req:CustomRequest, res) => {
    if(PRESETS[req.params.id]){
        return res.json(PRESETS[req.params.id]);
    }else{
        let con = await r.connect(RETHINK_DB);
        let preset = await r.table("presets").get(req.params.id).run(con) as GraphConfigModel;
        if(preset && preset.owner === req.user.id){
            res.json(preset);
        }
        else return res.status(404).send();
    }
});