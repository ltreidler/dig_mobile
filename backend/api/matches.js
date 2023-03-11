const router = require("express").Router();
const driver = require("../db/db");
const parseNeo = require('../db/utils');

// /api/matches
// sends back paginated matches, 10 at a time
// to do: filters for age, location, breed, etc.
router.get('/', async (req, res, next) => {
    try {
        let {page} = req.query || 1;
        if(isNaN(Number(page)) || page < 1) page = 1;
        const offset = (page - 1) * 10;

        const dogId = 1244;

        const session = driver.session();

        const query = `
        MATCH (d1:Dog)-[r1*]->(n)<-[r2*]-(d2:Dog)
        WHERE id(d1) = $dogId
        AND d1 <> d2
        AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        UNWIND r1 as rel1
        UNWIND r2 as rel2
        WITH SUM(rel1.weight*rel2.weight) AS similarity, d2 AS match, ID(d2) as id, count(*) as frequency
        MATCH (match)-[:IS_A|IS_SIZE|IS_SEX|HAS_ENERGY|IS_AGE]->(b)
        RETURN similarity, id, match.name AS name, match.image AS image, frequency, collect(b) AS details
        ORDER BY similarity DESC
        SKIP ${offset}
        LIMIT 10
        `;

        const data = await session.executeWrite((tx) => 
            tx.run(query, {dogId}));

        //console.log(data.records[0].get('details')[0].properties.name);
        console.log(data.records[0].get('details'));
        
        const matches = data.records.map(record => {
            const details = record.get('details').reduce((all, node) => {
                let label = node.labels[0].toLowerCase();
                all[label] = node.properties[Object.keys(node.properties)[0]];
                return all;
            }, {});

            return {
                id: record.get('id').toNumber(),
                similarity: record.get('similarity'),
                name: record.get('name'),
                image: record.get('image'),
                ...details
            }
        })

        res.send(matches);

        await session.close();

        
    
    }   catch (err) {
        next(err);
    } 
})

// /api/matches/like/:dogId
// creates like relationship, sends back whether the other user has also liked
router.post('/like/:dogId', async (req, res, next) => {
    try {

    } catch (err) {
        next(err);
    }
})

// /api/matches/dislike/:dogId
// creates dislike relationship
router.post('/dislike/:dogId', async (req, res, next) => {
    try {

    } catch (err) {
        next(err);
    }
})

module.exports = router;

