const r = require('rethinkdb');


let firstTry = null
let retried = false;
function connectDatabase(callback){
    if(firstTry === null)firstTry = new Date();
    try{
        r.connect({"host": process.env.RETHINK_DB_HOST || "localhost", "port":process.env.RETHINK_DB_PORT || 28015, "db":process.env.RETHINK_DB_DATABASE || "linksOfTheAnvil"}, 
        (err, conn) => 
        {
            if(err){
                console.error("Could not open a connection to the database");
                if(new Date() - firstTry < 1000 * 30){
                    console.error("Retrying");
                    setTimeout(() => connectDatabase(callback), 200);
                }else{
                    console.error("Retried for over 30s, the database is down. Exiting");
                    console.error(err.message);
                    process.exit(1);
                }
            }else{               
                try{
                    onStartup(err, conn, callback);
                }catch(e){
                    if(new Date() - firstTry < 1000 * 30){
                        console.error("Retrying");
                        setTimeout(() => connectDatabase(callback), 1000);
                    }else{
                        console.error("Retried for over 30s, the database is down. Exiting");
                        console.error(err.message);
                        process.exit(1);
                    }
                }
            }
        }            
        );
    }catch{

    }   
}

function onStartup(err, conn, callback){
    if (err) {
        console.error("Could not open a connection to initialize the database");
        console.error(err.message);
        process.exit(1);
    }

    r.table('worlds').run(conn).then((err, result) => {
        console.log("Database is initialized, starting web server");
        callback();
    }).error(err => {
        if(!err.message.includes("does not exist")){
            if(new Date() - firstTry < 1000 * 30){
                console.error("Retrying");
                setTimeout(() => connectDatabase(callback), 1000);
            }else{
                console.error("Retried for over 30s, the database is down. Exiting");
                console.error(err.message);
                process.exit(1);
            }
            return;
        }
        console.log("Initializing Database");
        r.dbCreate("linksOfTheAnvil").run(conn).finally(() => {
            r.tableCreate("presets").run(conn);
            return r.tableCreate("worlds").run(conn);
        }).then(result => {
            console.log("Database is initialized, starting web server");
            callback();
        }).error(err => {
            if(err){
                console.error("Error while initializing database");
                console.error(err);
                process.exit(1);
            }
            console.log("Database is initialized, starting web server");
            callback();
        });
    });
}

module.exports = {connectDatabase};