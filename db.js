/** Database setup for key_blogger. */

const { Client } = require("pg");
const { DB_URI } = require("./config");

const client = new Client({
    connectionString: DB_URI
});

client.connect();

module.exports = client;