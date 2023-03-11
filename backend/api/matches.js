const router = require("express").Router();
const driver = require("../db/db");
const neo4j = require('neo4j-driver');

// /api/matches
// sends back paginated matches, 10 at a time
// to do: filters for age, location, breed, etc.
router.get('/', async (req, res, next) => {
    try {
        let {page} = req.query || 1;
        if(isNaN(Number(page)) || page < 1) page = 1;
        const offset = neo4j.int((page - 1) * 10);
        const id = neo4j.int(req.query.id);

        const session = driver.session();

        const query = `
        MATCH (d1:Dog)-[r1*]->(n)<-[r2*]-(d2:Dog)
        WHERE id(d1) = $id
        AND d1 <> d2
        AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        UNWIND r1 as rel1
        UNWIND r2 as rel2
        WITH SUM(rel1.weight*rel2.weight) AS similarity, d2 AS match, ID(d2) as id, count(*) as frequency
        MATCH (match)-[:IS_A|IS_SIZE|IS_SEX|HAS_ENERGY|IS_AGE]->(b)
        RETURN similarity, id, match.name AS name, match.image AS image, frequency, collect(b) AS details
        ORDER BY similarity DESC
        SKIP $offset
        LIMIT 10
        `;

        const data = await session.executeWrite((tx) => 
            tx.run(query, {id, offset}));

        
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

        await session.close();

        res.json(matches);

        

        
    
    }   catch (err) {
        next(err);
    } 
})

// /api/matches/like/:dogId
// creates like relationship, sends back whether the other user has also liked
router.post('/like', async (req, res, next) => {
    try {
        const {dogId, matchId} = req.body;

        const session = driver.session();

        const query = `
        MATCH (d:Dog), (m:Dog)
        WHERE id(d) = $dogId AND id(m) = $matchId
        MERGE (d)-[r1:LIKED]->(m)
        SET r1.weight = 0.5
        WITH d, m
        MATCH (m)-[r:LIKED]->(d)
        RETURN r AS relationship`;

        const data = await session.executeWrite((tx) => 
            tx.run(query, {dogId: neo4j.int(dogId), matchId: neo4j.int(matchId)}));

        await session.close();

        let relationshipStatus = data.records.length ? data.records[0].get('relationship').type === 'LIKED' : false;

        res.json({match: relationshipStatus});

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

