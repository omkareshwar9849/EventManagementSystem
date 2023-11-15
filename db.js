const { MongoClient } = require('mongodb');

const mongoURI = 'mongodb://0.0.0.0:27017';
const dbName = 'EventHandling';

let db;
let client;

async function connectToDatabase() {
    client = new MongoClient(mongoURI);
    await client.connect();
    console.log('Connected successfully to server');
    db = client.db(dbName);
    return db;
}

module.exports = connectToDatabase;