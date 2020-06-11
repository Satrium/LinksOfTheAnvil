const fetch = require('node-fetch');
const fs = require('fs');

const regex = /(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/gi;
const baseurl = "https://www.worldanvil.com/api/aragorn/";
const headers = {
    "x-application-key":"NQ5TPQ6EbZP74CusuwkcmTKvdZELMWvB",
    "ContentType":"application/json"
}

const token = "yPLt45XY5c0Ordz5J6dVkBKEAPxh04zMEzIiNFFnXx3JiFSoH8prPBwDFHq3jkN3TU06mSIELJIOwJPegxw6MiJD0l1eAYvQCpZAo4ikX7l73WqcOTD4F5gvubgbbkjToIUkJ0qnu5tUgqA9jiJVc8JL4khVSgcDhLmR6QeGKAv3ShhUGQxW3jmr1rGGXckJeimNpDuIbC8Ngvh5RYRQxJClIzRPZsHBkxhcvaDZa7ji9C2OnpwArXBDG";

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

async function processWorld(authToken, worldId){
    var articles = await getAllWorldArticles(authToken, worldId);
    console.log(articles.length);
    fs.writeFileSync('./articles.json', JSON.stringify(articles, null, 2) , 'utf-8');
    for(let i=0; i < articles.length; i++){
        try{
            articles[i].data = await getArticle(authToken, articles[i].id);
        }catch(e){
            articles[i].data = "ERROR " + e;
        }finally{
            console.log(articles[i].title)
            await sleep(100);
        }
    }
    fs.writeFileSync('./articles.json', JSON.stringify(articles, null, 2) , 'utf-8');
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
    //console.log(result);
    var ids = []
    result.nodes.forEach(x => ids.push(x.id));
    console.log(ids);
    result.links = result.links.filter(x => ids.includes(x.target));
    return result;
}
// getCurrentUser(token)
//     .then(x => getUserWorlds(token, x.id))
//     .then(x => processWorld(token, x.worlds[0].id))
//     .catch(error => console.error(error));
var data = require("./articles.json").filter(x => typeof(x.data) == "string").map(x => [x.id, x.title, x.url, x.template_type]);
// var graph = generateGraph(data);
// fs.writeFileSync('./graph.json', JSON.stringify(graph, null, 2) , 'utf-8');
//console.log(data);
result = data.reduce(function (r, a) {
    r[a[3]] = r[a[3]] || [];
    r[a[3]].push(a);
    return r;
}, Object.create(null));
console.log(result);