import { Router, Request } from 'express';
import { User } from '@global/worldanvil/user';
import { Graph } from '@global/graph';
import * as asyncRedis from 'async-redis';
import * as r from 'rethinkdb';
import { WorldAnvil } from '../worldanvil';
import { generateGraph, updateGraph } from '../graph';

export const apiRouter = Router();
const redis = asyncRedis.createClient({host: process.env.REDIS_HOST || "localhost", port: process.env.REDIS_PORT || 6379});

const DATA_VERSION = 2;

export type CustomRequest = Request & {userToken: string; user: User;}

apiRouter.use(async (req:CustomRequest, res, next) => {
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
});

apiRouter.get('/auth', (req:CustomRequest,res) => {
    res.json(req.user);
});

apiRouter.get('/user/worlds', async (req:CustomRequest, res) => {
    let worlds = await (req.app.get("WA") as WorldAnvil).getUserWorlds(req.userToken, req.user.id);
    return res.json(worlds);
});

apiRouter.get('/world/:id', async (req:CustomRequest, res) => {
    let con = await r.connect({"host": process.env.RETHINK_DB_HOST || "localhost", "port":process.env.RETHINK_DB_PORT || 28015, "db":process.env.RETHINK_DB_DATABASE || "linksOfTheAnvil"});
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
        await r.table('worlds').insert(graph).run(con);
        res.json(graph);        
    }
});