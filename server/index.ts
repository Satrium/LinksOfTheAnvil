import Bottleneck from 'bottleneck';
import { connectDatabase } from './database';
import express from 'express';
import { apiRouter } from './routes/api';
import { WorldAnvil } from './worldanvil';
import bodyParser from 'body-parser';
import config from './config';

const app = express();

app.set("WA", new WorldAnvil(config.get("worldanvil.appKey"), new Bottleneck({
    ...config.get("ratelimit")    
    // datastore: "redis",
    // clientOptions: {
    //     host: process.env.REDIS_HOST || "localhost", 
    //     port: process.env.REDIS_PORT || 6379
    // }
})));

app.use(express.static(process.cwd() + "/dist/client"));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.use("/api", apiRouter);

app.use((req, res) => {
    res.sendFile(process.cwd()+"/dist/client/index.html");
});


console.log(`Starting webserver for URL ${config.get('url')}`)
connectDatabase().then(x => {
    if(x){
        app.listen(config.get("port"), () => {
            console.log(`Webserver listening on port ${config.get('port')}`)
        });
    }else{
        console.error("Could not connect to database");
    }
});