const r = require('rethinkdb');

function connectDatabase(callback){
    r.connect({"host":"localhost", "port":28015, "db":"linksOfTheAnvil"}, (err, conn) => onStartup(err, conn, callback));
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
        console.log("Initializing Database");
        r.dbCreate("linksOfTheAnvil").run(conn).finally(() => {
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