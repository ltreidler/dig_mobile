const router = require("express").Router();
const driver = require("../db/db");

router.put('/login', async (req, res, next) => {
    try {
        const {username, password} = req.body;
        console.log(req.body);

        const session = driver.session();

        const query = `
        MATCH (dog:Dog {username: $username, password: $password})
        WITH dog
        MATCH (dog)-[:IS_A|IS_SIZE|IS_SEX|HAS_ENERGY|IS_AGE]->(b)
        RETURN dog.username AS username, id(dog) AS id, collect(b) AS details`;

        let data = await session.executeWrite((tx) => 
            tx.run(query, {username, password}));

        if(!data || !data.records.length) throw new Error('Dog not found');

        data = data.records[0];

        const details = data.get('details').reduce((all, node) => {
            let label = node.labels[0].toLowerCase();
            all[label] = node.properties[Object.keys(node.properties)[0]];
            return all;
        }, {});

        const dog = {
            id: data.get('id').toNumber(),
            username: data.get('username'),
            ...details
        }

        res.send(dog);

    } catch (err) {
        next(err);
    }
})

module.exports = router;