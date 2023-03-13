require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT || 3000;
const driver = require('./db/db');

const init = async () => {
    try{
        console.log('Testing db connection...');
        await driver.getServerInfo();
        console.log('Successfully connected!');

        app.listen(PORT, () => console.log(`Listening on ${PORT}`))
    } catch(err) {
        console.error(err);
    }
}

init();


