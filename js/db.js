const {
    Pool,
    Client
} = require("pg");
const connectionString = process.env.DATABASE_URL;


const db = {};

function runQuery(query) {
    let response = null;
    const client = new Client({
        connectionString: connectionString
    })

    try {
        client.connect()
        if (client) {
            client.query(query, (err, res) => {
                console.log(err, res)
                response = res.rows;
                client.end()
            })
        };
    } catch (e) { /* OOPS */ }

    return response;
}

db.insert = function (query) {
    return runQuery(runQuery);
}

db.select = function (query) {
    return runQuery(runQuery);
}

db.delete = function (query) {
    //db.update(query); //Never delete in a LIVE system. Instead update and mark it as "deleted".
    return runQuery(runQuery);
}

db.update = function (query) {
    return runQuery(runQuery);
}

module.exports = db;
