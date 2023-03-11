const router = require("express").Router();
const driver = require("../db/db");

router.get('/login', async (req, res, next) => {
    try {
        const {username, password} = req.body;

        const session = driver.session();

        const query = `
        MATCH (dog:Dog {username: $username, password: $password})
        WITH dog
        MATCH (dog)-[:IS_A|IS_SIZE]->(traits)
        RETURN dog, id(dog) AS id, collect(b) AS details`;

        const data = await session.executeWrite((tx) => 
            tx.run(query, {username, password})).records[0];

        const details = data.get('details');

        const dog = {
            id: data.get('id').toNumber(),
            energy: details[0].properties.level,
            breed: details[1].properties.name,
            age: details[2].properties.category,
            size: details[3].properties.category,
            sex: details[4].properties.type
        }

        res.send(dog);

    } catch (err) {
        next(err);
    }
})

module.exports = router;