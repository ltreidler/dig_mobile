require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT || 3000;

const neo4j = require('neo4j-driver');

const config = {logging: {
    level: 'info',
    logger: (level, message) => console.log(level + ' ' + message)
}}

const driver = neo4j.driver(
    process.env.DB_URI, 
    neo4j.auth.basic('neo4j', process.env.DB_PASSWORD), 
    config);



const init = async () => {
    try{
        console.log('Testing db connection...');
        await driver.getServerInfo();
        console.log('Successfully connected!');

        app.listen(PORT, () => console.log(`Mixing it up on port ${PORT}`))
    } catch(err) {
        console.error(err);
    }
}

init();

module.exports = driver;