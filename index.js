var worldanvil = require('./worldanvil.js');
const path = require('path');
var express = require('express');
var app = express();

app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'))
});

app.get('/api/user', (req, res) => {
    if(req.header("x-auth-token")){
        worldanvil.getCurrentUser(req.header("x-auth-token"))
            .then(x => worldanvil.getUserWorlds(req.header("x-auth-token"), x.id))
            .then(x => res.json(x))
            .catch(x => console.error(x));
    }
    
});

app.get('/api/world/:id', (req, res) => {
    if(req.header("x-auth-token")){
        worldanvil.getAllWorldArticles(req.header("x-auth-token"), req.params.id)
            .then(x => worldanvil.enrichWithData(req.header("x-auth-token"), x))
            .then(x => worldanvil.generateGraph(x))
            .then(x => res.json(x))
            .catch(x => {console.error(x); res.status(500)})
    }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
