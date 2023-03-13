const router = require("express").Router();
const driver = require("../db/db");
const neo4j = require('neo4j-driver');
const parseTraits = require('../db/utils');

// /api/matches
// sends back matches, 10 at a time, and updates which have been scrolled past
router.get('/', async (req, res, next) => {
    try {
        const id = neo4j.int(req.query.id);

        const session = driver.session();


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
        WITH d2, COALESCE(r.weight*1.5, 0) AS match_score, r.weight AS weight, jacc, similarity, d1

        MATCH (d2)-[]->(trait)
        WHERE NOT labels(trait)[0] = 'Dog'
        WITH d2, similarity+jacc+match_score as score, collect(trait.name) AS traits, collect(labels(trait)[0]) AS trait_labels, d1, match_score
        ORDER BY score DESC
        LIMIT 10
    
        MERGE (d1)-[r:SAW]->(d2)
        SET r.timestamp = datetime()
        RETURN d2.name AS name, d2.image AS image, d2.username AS username, id(d2) AS id, score, traits, trait_labels, match_score
        `;


 

        const {records} = await session.executeWrite((tx) => 
            tx.run(query, {id}));

        const matches = records.map(record => {
            const all_traits = parseTraits(record);
      
            const matched = typeof record.get('match_score') === 'number';

            return {
                id: record.get('id').toNumber(),
                name: record.get('name'),
                image: record.get('image'),
                username: record.get('username'),
                matched,
                score: record.get('score').toFixed(2),
                ...all_traits
            }
      
        })

        await session.close();

        res.json(matches);
    
    }   catch (err) {
        next(err);
    } 
})

// /api/friends
// sends back the user's friends
router.get('/friends', async (req, res, next) => {
    try {
        let {id, page} = req.query;
        
        if(isNaN(Number(page)) || page < 1) page = 1;
        let offset = (Number(page) - 1) * 10;

        const session = driver.session();

        const query = `
        MATCH (d:Dog)-[:FRIENDS_WITH]-(d2:Dog)
        WHERE id(d) = $id AND d2 <> d
        MATCH (d2)-[]->(trait)
        WHERE NOT labels(trait)[0] = 'Dog'
        RETURN collect(trait.name) AS traits, collect(labels(trait)[0]) AS trait_labels, d2.name AS name, d2.image AS image, d2.username AS username, id(d2) AS id
        SKIP $offset
        LIMIT 10
        `;

        const {records} = await session.executeWrite((tx) => 
            tx.run(query, {id: neo4j.int(id), offset: neo4j.int(offset)}));
        
        const friends = records.map(record => {

            const all_traits = parseTraits(record)

            return {
                id: record.get('id').toNumber(),
                name: record.get('name'),
                image: record.get('image'),
                username: record.get('username'),
                ...all_traits
            }

        })


        await session.close();

        res.json(friends);

    } catch(err) {
        next(err);
    }
})

// /api/matches/like
// creates like relationship, sends back whether the other user has also liked
router.post('/like', async (req, res, next) => {
    try {
        const {id, matchId} = req.body;

        const session = driver.session();

        const query = `
        MATCH (d:Dog), (m:Dog)
        WHERE id(d) = $id AND id(m) = $matchId
        MERGE (d)-[l:LIKED]->(m)
        SET l.weight = 0.5
        `;

        await session.executeWrite((tx) => 
            tx.run(query, {id: neo4j.int(id), matchId: neo4j.int(matchId)}));

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

// /api/matches/dislike/:dogId
// creates dislike relationship
router.post('/friend', async (req, res, next) => {
    try {
        const {id, matchId} = req.body;

        const session = driver.session();

        const query = `
        MATCH (f:Dog)-[r2:LIKED]->(d:Dog)
        WHERE id(d) = $id AND id(f) = $matchId
        WITH d, f, r2
        DELETE r2
        WITH d, f
        MERGE (d)-[r:FRIENDS_WITH]-(f)`;

        await session.executeWrite((tx) => 
            tx.run(query, {id: neo4j.int(id), matchId: neo4j.int(matchId)}));

        await session.close();

        res.status(201).send();

    } catch (err) {
        next(err);
    }
})

module.exports = router;

