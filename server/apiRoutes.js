const express = require('express');
const asyncRedis = require("async-redis");
const r = require('rethinkdb');
const { WorldAnvilError } = require('./worldanvil');


const regex = /(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/gi;
const client = asyncRedis.createClient({host: process.env.REDIS_HOST || "localhost", port: process.env.REDIS_PORT || 6379});

var apiRouter = express.Router();

apiRouter.use(async (req, res, next) => {
    if(!req.header("x-auth-token")) return res.status(401);
    else {
        req.userToken = req.header("x-auth-token");
        let cache = await client.get("user." + req.userToken);
        req.user = cache != null?JSON.parse(cache):await req.app.get("worldanvil").getCurrentUser(req.userToken)
                .then(x => req.app.get("worldanvil").getUser(req.userToken, x.id))
                .then(x => {client.set("user." + req.userToken, JSON.stringify(x)); return x;})
                .catch(x => {res.status(401); console.error(x);});                
        next();
    }
});

apiRouter.get('/auth', (req,res) => {
    res.json(req.user);

});

apiRouter.get('/user/worlds', (req, res) => {
    req.app.get("worldanvil").getUserWorlds(req.userToken, req.user.id)
        .then(x => res.json(x))
        .catch(x => {console.error(x); res.status(500).send(x.message);}); 
});


apiRouter.get('/world/:id', async (req, res) => {
    r.connect({"host": process.env.RETHINK_DB_HOST || "localhost", "port":process.env.RETHINK_DB_PORT || 28015, "db":process.env.RETHINK_DB_DATABASE || "linksOfTheAnvil"})
        .then(conn => {
            r.table('worlds').get(req.params.id).run(conn).then(async x => {
                if(x){
                    if(x.author === req.user.id){
                        if(new Date().getTime() - new Date(x.last_update).getTime() > 1000) // 5 Minuten
                        {
                            let graph = await req.app.get("worldanvil").getAllWorldArticles(req.userToken, req.params.id)
                                .then(async articles => await updateGraph(x, articles,req.app.get("worldanvil"),req.userToken));
                            graph.last_update = new Date();
                            await r.table('worlds').update(graph).run(conn).error(console.error);
                            return res.json(x);
                        }else{
                            return res.json(x);
                        }
                            
                        
                    } 
                    else return res.status(403);
                }else{
                    req.app.get("worldanvil").getWorld(req.userToken, req.params.id)
                        .then(x => {
                            if(x.author.id !== req.user.id){
                                throw new WorldAnvilError(401);
                            }
                            return x;
                        }).then(() => req.app.get("worldanvil").getAllWorldArticles(req.userToken, req.params.id))
                        .then(async articles => {
                            await Promise.allSettled(
                                articles.map(async(article, index) => {                                    
                                    article.data = await req.app.get("worldanvil").getArticle(req.userToken, article.id);
                                    console.log(index + "/", articles.length)
                                })
                            ).then(x => console.log("Article loading done")).catch(x => console.log("Article loading failed"))
                            return articles;
                        }).then(articles => generateGraph(articles))
                        .then(graph => {
                            r.table('worlds').insert({...graph, id:req.params.id, author:req.user.id, last_update:new Date()}).run(conn).error(console.error);
                            return res.json(graph);
                        }).catch(error => {
                            console.error(error);
                            return res.status(500);
                        });
                }
            });
        });        
    
});

apiRouter.get('/world/:id/presets', async (req, res) => {
    r.connect({"host": process.env.RETHINK_DB_HOST || "localhost", "port":process.env.RETHINK_DB_PORT || 28015, "db":process.env.RETHINK_DB_DATABASE || "linksOfTheAnvil"})
        .then(conn => {
            r.table('presets').filter(x => x.worldId === req.params.id).run(conn).then(async presets => {
                return res.json(presets || []);
            })
        });
});

async function updateGraph(graph, articles, worldanvil, userToken){
    console.log("Updating Graph ", graph.id);
    const tags = graph.nodes.filter(x => x.group === "tag").map(x => x.name);
    let dictionary = Object.assign({}, ...articles.map((x) => ({[x.id]: x})));
    let updatesNeeded = new Set();
    let deleted = new Set();
    for(const [key, value] of Object.entries(graph.last_article_update)){
        if(key in dictionary){
            if(new Date(dictionary[key].last_update.date) > new Date(value)){
                updatesNeeded.add(key);
                graph.last_article_update[key] = dictionary[key].last_update.date;
                graph.links.filter(x => x.source === key && x.group !== "tagged").forEach(x => updatesNeeded.add(x.target));
            }
        }else{
            deleted.add(key);           
        }       
        
        delete dictionary[key];
    }
    if(deleted.size > 0){
        console.log("Deleted articles:", deleted);
        deleted.forEach(key => {
            graph.nodes = graph.nodes.filter(x => x.id != key);
            graph.links = graph.links.filter(x => !(x.source === key || x.target === key));
        });
    }
    if(updatesNeeded.size > 0){
        graph.links = graph.links.filter(x => !updatesNeeded.has(x.source));
        await Promise.all(
            [...updatesNeeded].map(async(id) => {
                graph
                let article = await worldanvil.getArticle(userToken, id);
                const {links, articleTags} = getConnections(article);
                articleTags.forEach(t => {
                    if(!tags.includes(t))graph.nodes.push({"id":t, "name":t, "group":"tag"});
                });
                graph.links.push(...links);
            })
        )    
    }   
    if(Object.keys(dictionary).length > 0){
        console.log("New articles", Object.keys(dictionary));
        await Promise.all(Object.keys(dictionary).map(async id => {
            let article = await worldanvil.getArticle(userToken, id);
            graph.last_article_update[id] = dictionary[id].last_update;
            graph.nodes.push(getNode(dictionary[id]));
            const {links, articleTags} = getConnections(article);
            articleTags.forEach(t => {
                if(!tags.includes(t))graph.nodes.push({"id":x, "name":x, "group":"tag"});
            });
            graph.links.push(...links);
        }));
    }
    
    var ids = []
    graph.nodes.forEach(x => ids.push(x.id));
    graph.links = [...new Set(graph.links.filter(x => ids.includes(x.target)))];
    return graph;
}

function getNode(article){
    return {
        "id":article.id, 
        "name":article.title, 
        "group":article.template_type, 
        "public":article.state == "public", 
        "draft":article.is_draft,
        "wip":article.is_wip, 
        "wordcount":article.wordcount, 
        "link":article.url,
        "tags": article.tag?article.tags.split(","):[]
    }
}

function getConnections(article){
    let result = [];
    let tags = new Set();
    let connections = [];
    if(article.tags) article.tags.split(",").forEach(tag => {
        tags.add(tag);
        result.push({"source":article.id, "target":tag, "group":"tagged", "label":"tagged"});
    });
    
    if(article.content){
        connections = connections.concat(article.content.match(regex) || []);
                
    } 
    if(article.sections){
        for(var section of Object.values(article.sections ||{})){
            if(!section.content || typeof(section.content) != "string")continue;
            connections = connections.concat(section.content.match(regex) || [])
        } 
    }   
    [...new Set(connections)].forEach(connection => {
        result.push({"source":article.id, "target":connection, "group":"mention", "label":"mention"});
    }); 
    if(article.relations){
        for(let [key, value] of Object.entries(article.relations)){               
            if(!value.items)continue;
            if(value.type === 'singular')value.items = [value.items];
            for(let item of value.items){
                if(item.type === "image")continue;
                if(key === "children" || key == "childrenArticles")continue;
                result.push({'source':article.id, "target": item.id, "label":key, "group":key})
            }
        }
    }
    return {links:result, articleTags:tags};
}

function generateGraph(articles){
    var tags = new Set();
    var categories = new Set();
    var result = {nodes:[], links:[], last_article_update:{}, version:1};
    articles.forEach(article => {
        result.last_article_update[article.id] = article.last_update.date;
        result.nodes.push(getNode(article));        
        if(!article.data)return;
        const {links, articleTags} = getConnections(article.data);
        if(articleTags) articleTags.forEach(t => tags.add(t));
        if(links)result.links.push(...links);
    });
    tags.forEach(x => {
        result.nodes.push({"id":x, "name":x, "group":"tag"})
    });
    var ids = []
    result.nodes.forEach(x => ids.push(x.id));
    result.links = result.links.filter(x => ids.includes(x.target));
    return result;
}

module.exports = {apiRouter}