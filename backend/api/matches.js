const router = require("express").Router();
const driver = require("../db/db");
const neo4j = require('neo4j-driver');

// /api/matches
// sends back paginated matches, 10 at a time
// to do: filters for age, location, breed, etc.
router.get('/', async (req, res, next) => {
    try {
        const id = neo4j.int(req.query.id);

        const session = driver.session();

        //can I add in a way to look at whether the dogs have liked them back?

        const query = `
        OPTIONAL MATCH p = (d1:Dog)-[:LIKED|DISLIKED]-(d:Dog)-[:LIKED|DISLIKED]-(d2:Dog)
        WHERE id(d1) = $id AND d1 <> d2 AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        WITH d1, d2, REDUCE(s = 0, r IN collect(relationships(p)) | s + (r[0].weight * r[1].weight)) AS rels_similarity

        OPTIONAL MATCH (d1)-[r:SAW]->(d2)
        WITH d1, d2, rels_similarity, COALESCE(r.timestamp, datetime({year: 2000, month: 7})) AS last_saw

        OPTIONAL MATCH (d1)--(t)--(d2)
        WHERE NOT labels(t)[0] = 'Dog' AND NOT duration.between(last_saw, datetime()).days < 2
        WITH d2, collect(t.name) AS shared_traits, REDUCE(j = 0, t IN collect(t) | j + t.weight)/2.3 AS jacc, rels_similarity/5 AS similarity, d1
        WHERE jacc >= 0.1 AND similarity >= 0.1

        OPTIONAL MATCH (d2)-[r:LIKED]->(d1)
        WITH d2, COALESCE(r.weight*1.5, 0) AS match_score, jacc, similarity, d1 

        MATCH (d2)-[]->(trait)
        WHERE NOT labels(trait)[0] = 'Dog'
        WITH d2, similarity+jacc+match_score as score, collect(trait.name) AS traits, collect(labels(trait)[0]) AS trait_labels, d1, match_score
        ORDER BY score DESC
        LIMIT 10
        MERGE (d1)-[r:SAW]->(d2)
        SET r.timestamp = datetime()     
        RETURN d2.name AS name, d2.image AS image, id(d2) AS id, score, traits, trait_labels, match_score
        `;

        const data = await session.executeWrite((tx) => 
            tx.run(query, {id}));
        
        const matches = data.records.map(record => {
            const traits = record.get('traits');
            const all_traits = {};
            for(let i = 0; i < traits.length; i++) {
                all_traits[record.get('trait_labels')[i].toLowerCase()] = traits[i];
            }

            const matched = typeof record.get('match_score') === 'number';

            return {
                id: record.get('id').toNumber(),
                name: record.get('name'),
                image: record.get('image'),
                matched,
                score: record.get('match_score'),
                ...all_traits
            }

        })

        await session.close();

        res.json(matches);
    
    }   catch (err) {
        next(err);
    } 
})

// /api/matches/like
// creates like relationship, sends back whether the other user has also liked
router.post('/like', async (req, res, next) => {
    try {
        const {id, matchId} = req.body;

        const session = driver.session();
        console.log(id, matchId, 'LIKE!');

        const query = `
        MATCH (d:Dog), (m:Dog)
        WHERE id(d) = $id AND id(m) = $matchId
        MERGE (d)-[r1:LIKED]->(m)
        SET r1.weight = 0.5
        WITH d, m
        MATCH (m)-[r:LIKED]->(d)
        RETURN r AS relationship`;

        const data = await session.executeWrite((tx) => 
            tx.run(query, {id: neo4j.int(id), matchId: neo4j.int(matchId)}));

        console.log(data.records[0]);

        await session.close();

        res.json();

    } catch (err) {
        next(err);
    }
})

// /api/matches/dislike/:dogId
// creates dislike relationship
router.post('/dislike', async (req, res, next) => {
    try {
        const {id, matchId} = req.body;

        const session = driver.session();

        const query = `
        MATCH (d:Dog), (m:Dog)
        WHERE id(d) = $id AND id(m) = $matchId
        MERGE (d)-[r1:DISLIKED]->(m)
        SET r1.weight = -0.5`;

        await session.executeWrite((tx) => 
            tx.run(query, {id: neo4j.int(id), matchId: neo4j.int(matchId)}));

        await session.close();

        res.send();

    } catch (err) {
        next(err);
    }
})

module.exports = router;

