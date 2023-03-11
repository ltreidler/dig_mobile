const neo4j = require('neo4j-driver');
require('dotenv').config();

const config = {logging: {
    level: 'info',
    logger: (level, message) => console.log(level + ' ' + message)
}}

console.log(process.env.DB_URI, process.env.DB_PASSWORD);

const driver = neo4j.driver(
    process.env.DB_URI, 
    neo4j.auth.basic('neo4j', process.env.DB_PASSWORD));


module.exports = driver;