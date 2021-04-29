
  
import * as r from 'rethinkdb';
import config from './config';

const TABLES = ["worlds", "presets"];

export async function connectDatabase():Promise<boolean>{
    let date = new Date();
    // Try to connect to the database for 30 seconds
    while(+(new Date()) - +date < 1000 * 30){
        try{
            let con = await r.connect({
                "host": config.get("rethinkdb.host"), 
                "port": config.get("rethinkdb.port"), 
                "db": config.get("rethinkdb.db")
            });
            const db = process.env.RETHINK_DB_DATABASE || "linksOfTheAnvil";
            let tables = [];
            try{
                tables = await r.db(db).tableList().run(con);
            }catch(e){
                if(e.msg.includes("Database `" + db + "` does not exist.")){
                    console.log(`Database ${db} does not exist. Creating it.`);
                    await r.dbCreate(db).run(con);
                }else{
                    console.error("RethinkDB Error2", e);
                }
            }   
            for(let table of TABLES){
                if(!tables.includes(table)){
                    console.log(`Table ${table} does not exist. Creating it`);
                    await r.db(db).tableCreate(table).run(con);
                }
            }
            return true;
        }catch(e){
            console.error("RethinkDB Error", e.msg, e);
        }
        await sleep(500);
    }
    return false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}