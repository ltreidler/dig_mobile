const router = require("express").Router();
const driver = require("../db/db");
const parseNeo = require('../db/utils');

// /api/matches
// sends back paginated matches, 10 at a time
// to do: filters for age, location, breed, etc.
router.get('/', async (req, res, next) => {
    try {
        
        const session = driver.session();
        const dogName = 'Rod';

        const queryByLike = `
        MATCH (d1:Dog {name: $dogName})-[:LIKED]->(d3:Dog)<-[:LIKED]-(d2:Dog)
        WHERE d1 <> d2
        AND NOT (d1)-[:LIKED]->(d2)
        AND NOT (d1)-[:DISLIKED]->(d2)
        RETURN count(DISTINCT d2) as frequency, d2.name AS name, d2.energy AS energy, d2.weight AS weight, d2.sex AS sex, ID(d2) AS id
        ORDER BY frequency DESC
        LIMIT 20
        `;

        const queryByBreed = `
        MATCH (d1:Dog {name: $dogName})-[:IS_A]->(b:Breed)<-[:IS_A]-(d2:dog)
        WHERE d1 <> d2
        AND NOT (d1)-[:LIKED]->(d2)
        AND NOT (d1)-[:DISLIKED]->(d2)
        RETURN d2.name AS name, d2.energy AS energy, d2.weight AS weight, d2.sex AS sex, ID(d2) AS id
        `;

        const data = await session.executeWrite((tx) => 
            Promise.all([queryByLike, queryByBreed].map(query => 
                tx.run(query, {dogName}))));

        let byLikes = data[0].records;
        console.log(parseNeo(byLikes));
        
        console.log(byLikes.records, data.records);

        await session.close();

        res.json();
    
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

