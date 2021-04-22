const fetch = require('node-fetch');
const config = require("../config.json")

class WorldAnvil{

    baseurl = "https://www.worldanvil.com/api/aragorn/";

    constructor(appToken, bottleneck){
        this._appToken = appToken;
        if(bottleneck){
            var Bottleneck = require('bottleneck');
            this._limiter = new Bottleneck(bottleneck);
        }
    }

    request(url, userToken){
        console.debug("Starting: ", this.baseurl + url);
        let headers = {"x-application-key": this._appToken,"x-auth-token": userToken,"ContentType":"application/json", "User-Agent": `${config['name']} (${config['url']}, ${config['version']})`};
        if(this._limiter){
            return this._limiter.schedule(() => fetch(this.baseurl + url,{headers}))
                .then(res => {
                    if(res.status != 200)throw new WorldAnvilError("An error occured while connecting to the World Anvil API", res.status);
                    console.log("Done: ", this.baseurl + url);
                    return res.json();
                });
        }else{
            return fetch(this.baseurl + url,{headers})
                .then(res => {
                    if(res.status != 200)throw new WorldAnvilError("An error occured while connecting to the World Anvil API", res.status);
                    console.log("Done: ", this.baseurl + url);
                    return res.json();
                });
        }
    }

    getArticle(userToken, articleId){
        return this.request(`article/${articleId}`, userToken);
    }

    getBlock(userToken, blockId){
        return this.request(`block/${blockId}`, userToken);
    }

    getCurrentUser(userToken){ 
        return this.request("user", userToken); 
    }

    getUser(userToken, userId){
        return this.request(`user/${userId}`, userToken);
    }

    getUserWorlds(userToken, userId){ 
        return this.request(`user/${userId}/worlds`, userToken); 
    }

    getWorld(userToken, worldId){ 
        return this.request(`world/${worldId}`, userToken); 
    }

    getWorldArticles(userToken, worldId, offset=0){
        return this.request(`world/${worldId}/articles?offset=${offset}`, userToken);
    }

    getAllWorldArticles(userToken, worldId, offset=0){
        return this.getWorldArticles(userToken,worldId,offset)
            .then(x => 
                (!x.articles || x.articles.length < x.limit) ? 
                    (x.articles?x.articles:[]) :
                    this.getAllWorldArticles(userToken, worldId, parseInt(offset) + parseInt(x.limit)).then(y => y.concat(x.articles))
                );
    }

    getWorldBlocks(userToken, worldId, offset=0, order_by="id", trajectory="ASC"){
        return this.request(`world/${worldId}/blocks?offset=${offset}&order_by=${order_by}&trajectory=${trajectory}`);
    }    
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

module.exports = {WorldAnvil, WorldAnvilError}