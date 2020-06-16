const fetch = require('node-fetch');
const Bottleneck = require('bottleneck');

const regex = /(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/gi;
const baseurl = "https://www.worldanvil.com/api/aragorn/";

const limiter = new Bottleneck({
    id: "link-of-the-anvil",
    reservoir: 100,
    reservoirIncreaseInterval: 250,
    reservoirIncreaseAmount: 10,
    maxConcurrent: 10,
    minTime: 50,
    datastore: "redis",
    clientOptions: {
        host: process.env.REDIS_HOST || "localhost", 
        port: process.env.REDIS_PORT || 6379
    }
});

const limitFetch = limiter.wrap(fetch);

const headers = {
    "x-application-key":process.env.APP_KEY,
    "ContentType":"application/json"
}

function handleResponse(res){
    if(res.status != 200)throw new WorldAnvilError("An error occured while connecting to the World Anvil API", res.status);
    return res.json();
}

function getHeaders(authToken){
    return {
        ...headers,
        "x-auth-token": authToken
    };
}

function getCurrentUser(authToken){
    return limitFetch(baseurl + "user", {headers:getHeaders(authToken)})
        .then(handleResponse)
}

function getUserWorlds(authToken, userId){
    return limitFetch(baseurl + "user/" + userId + "/worlds", {headers: getHeaders(authToken)})
        .then(x => x.json())
}

function getWorld(authToken, worldId){
    return limitFetch(baseurl + "world/" + worldId, {headers: getHeaders(authToken)})
        .then(x => x.json())
}

function getWorldArticles(authToken, worldId, offset=0){
    return limitFetch(baseurl + "world/" + worldId + "/articles?offset=" + offset, {headers: getHeaders(authToken)})
        .then(x => x.json())
}

function getAllWorldArticles(authToken, worldId, offset=0){
    return  getWorldArticles(authToken, worldId, offset)
        .then(x => {console.log(x); return x;})
        .then(x => (!x.articles || x.articles.length < x.limit)? (x.articles?x.articles:[]):getAllWorldArticles(authToken, worldId, parseInt(offset) + parseInt(x.limit)).then(y => y.concat(x.articles)));
}

function getArticle(authToken, articleId){
    console.log(baseurl + "article/" + articleId);
    return limitFetch(baseurl + "article/" + articleId, {headers: getHeaders(authToken)})
        .then(x => x.json());
}

const concurrentRequests = 20;
async function enrichWithData(authToken, articles){
    for(var i=0; i < articles.length; i+=concurrentRequests){
        await Promise.all(articles.slice(i, i+concurrentRequests).map(async(article) => {
            article.data = await getArticle(authToken, article.id);
        }));
    }
    return articles;
}

function generateGraph(articles){
    var tags = new Set();
    var result = {nodes:[], links:[]};
    articles.forEach(article => {
        result.nodes.push({"id":article.id, "name":article.title, "group":article.template_type, "public":!article.is_draft && article.state == "public", "wordcount":article.wordcount, "link":article.url})        
        if(!article.data)return;
        let connections = [];
        if(article.data.tags) article.data.tags.split(",").forEach(tag => {
            tags.add(tag);
            result.links.push({"source":tag, "target":article.id, "group":"tagged", "label":"tagged"});
        });
        
        if(article.data.content){
            connections = connections.concat(article.data.content.match(regex) || []);
                    
        } 
        if(article.data.sections){
            for(var section of Object.values(article.data.sections ||{})){
                if(!section.content || typeof(section.content) != "string")continue;
                connections = connections.concat(section.content.match(regex) || [])
            } 
        }    
        [...new Set(connections)].forEach(connection => {
            result.links.push({"source":article.id, "target":connection, "group":"mention", "label":"mention"});
        });
        if(article.data.relations){
            for(let [key, value] of Object.entries(article.data.relations)){               
                if(!value.items)continue;
                if(value.type === 'singular')value.items = [value.items];
                for(let item of value.items){
                    if(item.type === "image")continue;
                    if(key === "children" || key == "childrenArticles")continue;
                    result.links.push({'source':article.id, "target": item.id, "label":key, "group":key})
                }
            }
        }
    });
    tags.forEach(x => {
        result.nodes.push({"id":x, "name":x, "group":"tag", wordcount:1000})
    })
    var ids = []
    result.nodes.forEach(x => ids.push(x.id));
    result.links = result.links.filter(x => ids.includes(x.target));
    return result;
}

class WorldAnvilError extends Error{
    constructor(message, statusCode, exception) {
        super(message);
       // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
       // This clips the constructor invocation from the stack trace.
       // It's not absolutely essential, but it does make the stack trace a little nicer.
       //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
        this.statusCode = statusCode;
        this.exception = exception;
      }
}

module.exports = {getCurrentUser,getUserWorlds, generateGraph, getAllWorldArticles, enrichWithData, getWorld, WorldAnvilError}

