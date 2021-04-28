import Bottleneck from 'bottleneck';
import { connectDatabase } from './database';
import express from 'express';
import { apiRouter } from './routes/api';
import { WorldAnvil } from './worldanvil';
import bodyParser from 'body-parser';

const app = express();

app.set("WA", new WorldAnvil(process.env.APP_KEY, new Bottleneck({
    id: "link-of-the-anvil",
    reservoir: 5,
    reservoirIncreaseInterval: 500,
    reservoirIncreaseAmount: 5,
    maxConcurrent: 10,
    minTime: 50,
    // datastore: "redis",
    // clientOptions: {
    //     host: process.env.REDIS_HOST || "localhost", 
    //     port: process.env.REDIS_PORT || 6379
    // }
})))

app.use(express.static(process.cwd() + "/dist/client"));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.use("/api", apiRouter);

app.use((req, res) => {
    res.sendFile(process.cwd()+"/dist/client/index.html");
});

const PORT = 3000;
connectDatabase().then(x => {
    if(x){
        app.listen(PORT, () => {
            console.log(`Webserver listening on port ${PORT}`)
        });
    }else{
        console.error("Could not connect to database");
    }
});