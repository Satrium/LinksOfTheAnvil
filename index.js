const path = require('path');
const asyncRedis = require("async-redis");
const client = asyncRedis.createClient({host: process.env.REDIS_HOST || "localhost", port: process.env.REDIS_PORT || 6379});

var express = require('express');


var worldanvil = require('./worldanvil.js');

var app = express();
app.use(express.static(process.cwd()+"/dist"));

app.get('/api/user', (req, res) => {
    if(req.header("x-auth-token")){
        worldanvil.getCurrentUser(req.header("x-auth-token"))
            .then(x => worldanvil.getUserWorlds(req.header("x-auth-token"), x.id))
            .then(x => res.json(x))
            .catch(x => {console.error(x); res.status(500).send(x.message);});
    }else{
        res.status(401);
    }
    
});

app.get('/api/world/:id', async (req, res) => {
    if(req.header("x-auth-token")){
        var cache = await client.get(req.header("x-auth-token") + "."+ req.params.id);
        if(cache){
            return res.json(JSON.parse(cache));
        }else{
            worldanvil.getAllWorldArticles(req.header("x-auth-token"), req.params.id)
                .then(x => worldanvil.enrichWithData(req.header("x-auth-token"), x))
                .then(x => worldanvil.generateGraph(x))
                .then(async x => {
                    await client.set(req.header("x-auth-token") + "." + req.params.id, JSON.stringify(x),'EX', 60 * 60);
                    return x;
                })
                .then(x => res.json(x))
                .catch(x => {console.error(x); res.status(500).send(x.message);});
        }        
    }else{
        res.status(401);
    }
});

app.use(function(req, res){
    res.sendFile(process.cwd()+"/dist/index.html");
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
