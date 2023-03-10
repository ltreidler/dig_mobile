const driver = require('../index.js');
const session = driver.session();
const axios = require('axios');




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