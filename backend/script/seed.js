const driver = require('../index.js');
const session = driver.session();
const axios = require('axios');

async function createDogs (n) {
    //get n/10 dog breeds
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';

    //21 = australian cattle dog, ESP = 103, 264 max

    //query for dog breed: https://api.thedogapi.com/v1/breeds/264

    //query for image: https://api.thedogapi.com/v1/images/search?size=&breed_ids=21

    //create a random number of each breed, saving them in arrays

    //give the dogs images

    //give them names

    //give them usernames based on their names

    //give them passwords (unencrypted, for now)

    //give the dogs random addresses, in a given city

    //give them random ages

    //give them energy levels within their age ranges

    //return the [breeds, dogs]
}

async function clearDb () {
    try {
        await session.executeWrite(tx => tx.run("MATCH (n) DETACH DELETE n"));
        console.log("Db cleared successfully");
      } catch(err) {
        console.error("Error clearing database:", err);
      }
}

async function seed () {
    try {
        
        console.log('Seeding...');

        if(process.env.CLEAR) await clearDb();

        const dogs = createDogs(100);

        const res = await session.executeWrite(tx => {
            return tx.run(
                'MERGE (d:Dog {name: $name}) RETURN d',
                { name: 'Maisie'}
            )
        });

        console.log(res.records[0].get('d'));
        console.log('Success!');

    } catch (err) {
        console.error(err);
    } finally {
        await session.close();
    } 
}



if (module === require.main) {
    seed();
}

module.export = seed;