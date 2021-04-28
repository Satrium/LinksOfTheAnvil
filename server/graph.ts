import { Graph, GraphLink, GraphNode } from "@global/graph";
import { Article, ArticleRelation, ArticleRelationItem } from "@global/worldanvil/article";
import { User } from "@global/worldanvil/user";
import { WorldAnvil } from "./worldanvil";

export const GRAPH_DATA_VERSION = 2;
const linkRegex = /(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/gi;

export async function generateGraph(WA:WorldAnvil, userToken:string, user:User, worldId:string):Promise<Graph>{
    
    // Get all articles
    var articleList = await WA.getAllWorldArticles(userToken, worldId);
    var world = await WA.getWorld(userToken, worldId);
    console.log(`Loading ${articleList.length} articles for ${world.name}`);
    var articles = await Promise.allSettled(
        articleList.map(async (article) => WA.getArticle(userToken, article.id))
    )
    console.log("Loaded articles");

    var allTags = new Set<string>();
    // var categories = new Set<{id:string, name:string, link:string}>();
    var graph:Graph = {version:GRAPH_DATA_VERSION,author:user.id,last_update: new Date(),id:worldId,links:[],nodes:[],last_article_update:{}, worldname:world.name}
    for(let result of articles){
        if(result.status === "fulfilled"){
            let article = result.value;
            if(!article){
                console.error(`Could not load article because it's null`);
                continue;
            };
            // if(article.category) categories.add({id:article.category.id,name:article.category.title, link:article.category.url})
            graph.nodes.push(getNodeFromArticle(article));
            graph.last_article_update[article.id] = article.update_date?.date || article.last_update?.date;
            const {links, tags} = getConnections(article);
            if(tags) tags.forEach(t => allTags.add(t));
            if(links) graph.links.push(...links);
        }else{
            console.error(`Could not load article because ${result.reason}`);
        }        
    }
    allTags.forEach(tag => {
        graph.nodes.push({"id":tag, "name":tag, "type":"tag"});
    });
    var ids = new Set<string>();
    graph.nodes.forEach(x => ids.add(x.id));
    graph.links = graph.links.filter(x => ids.has(x.target as string));
    return graph;
}

export async function updateGraph(graph:Graph, WA:WorldAnvil, userToken:string):Promise<Graph>{
    
    let articles = await WA.getAllWorldArticles(userToken, graph.id);
    let globalTags = graph.nodes.filter(x => x.type === "tag").map(x => x.name);

    let updates = new Set<string>();
    let deleted = new Set();
    let articleDict = Object.assign({}, ...articles.map((x) => ({[x.id]: x}))) as {[key:string]:Article};
    
    for(const [articleId, date] of Object.entries(graph.last_article_update)){        
        if(articleId in articleDict){
            if(new Date(articleDict[articleId].update_date?.date || articleDict[articleId].last_update?.date) > new Date(date)){
                updates.add(articleId);
                graph.last_article_update[articleId] = articleDict[articleId].update_date?.date || articleDict[articleId].last_update?.date;
            }
        }else{
            // The article has been deleted
            deleted.add(articleId);
        }
        // Delete the article from the dictionary to have only new articles left in the end
        delete articleDict[articleId];
    }

    // Add related articles for updates as well
    graph.links.filter(x => updates.has(x.source as string) && x.type !== "tagged").forEach(x => updates.add(x.target as string));

    // Delete nodes that no longer exist, their links and all links of articles that will get updated now
    if(deleted.size > 0)graph.nodes = graph.nodes.filter(x => deleted.has(x.id))
    graph.links = graph.links.filter(x => !deleted.has(x.source) && !deleted.has(x.target) && !updates.has(x.source as string));

    // Update changed articles
    if(updates.size > 0){
        await Promise.allSettled(
            [...updates].map(async(id) => {
                graph
                let article = await WA.getArticle(userToken, id);
                const {links, tags} = getConnections(article);
                tags.forEach(t => {
                    if(!globalTags.includes(t))graph.nodes.push({"id":t, "name":t, "type":"tag"});
                });
                graph.links.push(...links);
            })
        )    
    }

    // New Articles
    if(Object.keys(articleDict).length > 0){
        await Promise.allSettled(Object.keys(articleDict).map(async id => {
            let article = await WA.getArticle(userToken, id);
            // If there is a private article by another author, it will return empty. This might be a bug in Aragorn
            if(!article)return;
            graph.last_article_update[id] = articleDict[id].update_date?.date || articleDict[id].last_update?.date;
            graph.nodes.push(getNodeFromArticle(articleDict[id]));
            const {links, tags} = getConnections(article);
            tags.forEach(t => {
                if(!globalTags.includes(t))graph.nodes.push({"id":t, "name":t, "type":"tag"});
            });
            graph.links.push(...links);
        }));
    }

    var ids = []
    graph.nodes.forEach(x => ids.push(x.id));
    graph.links = [...new Set(graph.links.filter(x => ids.includes(x.target)))];
    return graph;
}

function getNodeFromArticle(article:Article): GraphNode{
    return {
        id: article.id,
        name: article.title,
        type: article.template,
        public:article.state == "public", 
        draft:article.is_draft,
        wip:article.is_wip, 
        wordcount:article.wordcount, 
        url:article.url,
        tags: article.tags?article.tags.split(","):[]
    };
}

function getConnections(article:Article):{links:GraphLink[], tags:Set<string>}{
    let result:GraphLink[] = [];
    let tags = new Set<string>();
    let connections = [];
    if(article.tags) article.tags.split(",").forEach(tag => {
        tags.add(tag);
        result.push({"source":article.id, "target":tag, "type":"tagged", "label":"tagged"});
    });

    if(article.category){
        result.push({"source":article.category.id, "target": article.id, "type":"category", "label":"category"})
    }
    
    if(article.content){
        connections = connections.concat(article.content.match(linkRegex) || []);                
    } 
    if(article.sections){
        for(var section of Object.values(article.sections ||{})){
            if(!section.content || typeof(section.content) != "string")continue;
            connections = connections.concat(section.content.match(linkRegex) || [])
        } 
    }   
    [...new Set(connections)].forEach(connection => {
        result.push({"source":article.id, "target":connection, "type":"mention", "label":"mention"});
    }); 
    if(article.relations){
        for(let [key, value] of Object.entries(article.relations)){    
            if(!(value as ArticleRelation).items)continue;
            if(value.type === 'singular')(value as ArticleRelation).items = ([(value as ArticleRelation).items] as ArticleRelationItem[]);
            for(let item of ((value as ArticleRelation).items as ArticleRelationItem[])){
                if(item.type === "image")continue;
                result.push({'source':article.id, "target": item.id, "label":key, "type":key})
            }
        }
    }
    return {links:result, tags:tags};
}