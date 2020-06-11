const fetch = require('node-fetch');

const regex = /(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/gi;
const baseurl = "https://www.worldanvil.com/api/aragorn/";
const headers = {
    "x-application-key":process.env.APP_KEY,
    "ContentType":"application/json"
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}

function getHeaders(authToken){
    return {
        ...headers,
        "x-auth-token": authToken
    };
}

function getCurrentUser(authToken){
    return fetch(baseurl + "user", {headers:getHeaders(authToken)})
        .then(x => x.json());
}

function getUserWorlds(authToken, userId){
    return fetch(baseurl + "user/" + userId + "/worlds", {headers: getHeaders(authToken)})
        .then(x => x.json())
}

function getWorldArticles(authToken, worldId, offset=0){
    return fetch(baseurl + "world/" + worldId + "/articles?offset=" + offset, {headers: getHeaders(authToken)})
        .then(x => x.json())
}

function getAllWorldArticles(authToken, worldId, offset=0){
    return getWorldArticles(authToken, worldId, offset)
        .then(x => {console.log(x); return x;})
        .then(x => (!x.articles || x.articles.length < x.limit)? (x.articles?x.articles:[]):getAllWorldArticles(authToken, worldId, parseInt(offset) + parseInt(x.limit)).then(y => y.concat(x.articles)));
}

function getArticle(authToken, articleId){
    return fetch(baseurl + "article/" + articleId, {headers: getHeaders(authToken)})
        .then(x => x.json());
}

async function enrichWithData(authToken, articles){
    console.log(authToken, typeof(articles));
    for(var article of articles){
        article.data = await getArticle(authToken, article.id);
        await sleep(10);
    }
    return articles;
}

function generateGraph(articles){
    var result = {nodes:[], links:[]};
    articles.forEach(article => {
        result.nodes.push({"id":article.id, "name":article.title, "group":article.template_type})
        if(!article.data)return;
        let connections = [];
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
            //result.links.push({"source":article.id, "target":connection, dashes:true, physics:false, width: 0.5, "group":"mention"});
        });
        if(article.data.relations){
            for(let [key, value] of Object.entries(article.data.relations)){               
                if(!value.items)continue;
                if(value.type === 'singlular')value.items = [value.items];
                console.log("-->", key, value.items);
                for(let item of value.items){
                    if(item.type === "image")continue;
                    if(key === "children" || key == "childrenArticles")continue;
                    result.links.push({'source':article.id, "target": item.id, "label":key, "group":key})
                }
            }
        }
    });
    var ids = []
    result.nodes.forEach(x => ids.push(x.id));
    result.links = result.links.filter(x => ids.includes(x.target));
    return result;
}

module.exports = {getCurrentUser,getUserWorlds, generateGraph, getAllWorldArticles, enrichWithData}
// getCurrentUser(token)
//     .then(x => getUserWorlds(token, x.id))
//     .then(x => processWorld(token, x.worlds[0].id))
//     .catch(error => console.error(error));
// var data = require("./articles.json").filter(x => typeof(x.data) == "string").map(x => [x.id, x.title, x.url, x.template_type]);
// var graph = generateGraph(data);
// fs.writeFileSync('./graph.json', JSON.stringify(graph, null, 2) , 'utf-8');
// //console.log(data);
// result = data.reduce(function (r, a) {
//     r[a[3]] = r[a[3]] || [];
//     r[a[3]].push(a);
//     return r;
// }, Object.create(null));
// console.log(result);