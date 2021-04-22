const path = require('path');
const asyncRedis = require("async-redis");
const client = asyncRedis.createClient({host: process.env.REDIS_HOST || "localhost", port: process.env.REDIS_PORT || 6379});

var express = require('express');


var worldanvil = require('./worldanvil.js');
const { WorldAnvil } = require('./server/worldanvil.js');
const { apiRouter } = require('./server/apiRoutes.js');
const { connectDatabase } = require('./server/database.js');

var app = express();
app.set("worldanvil", new WorldAnvil(process.env.APP_KEY, {
    id: "link-of-the-anvil",
    reservoir: 100,
    reservoirIncreaseInterval: 500,
    reservoirIncreaseAmount: 5,
    maxConcurrent: 10,
    minTime: 50,
    // datastore: "redis",
    // clientOptions: {
    //     host: process.env.REDIS_HOST || "localhost", 
    //     port: process.env.REDIS_PORT || 6379
    // }
}));
app.use(express.static(process.cwd()+"/dist"));
app.use('/api', apiRouter);


app.use(function(req, res){
    res.sendFile(process.cwd()+"/dist/index.html");
});

connectDatabase(() => {
    app.listen(3000, function () {
        console.log('Example app listening on port 3000!');
      });
});


