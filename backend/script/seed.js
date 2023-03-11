const driver = require("../db/db");
const session = driver.session();
const createDogs = require("./data/dog_breeds");

async function clearDb() {
  try {
    await session.executeWrite((tx) => tx.run("MATCH (n) DETACH DELETE n"));
    console.log("Db cleared successfully");
  } catch (err) {
    console.error("Error clearing database:", err);
  }
}

async function seed() {
  try {
    console.log("Seeding...");

    console.log("Clearing db...");
    await clearDb();

    const { breeds, breedGroups, dogs, relationships} = await createDogs(200);

    console.log(relationships.length, dogs.length, breeds.length);
    
    //create dog breed groups
    await session.executeWrite((tx) =>
      Promise.all(
        breedGroups.map((group_name) =>
          tx.run(
            `
                    CREATE (g:Group {name: $group_name})
                    RETURN g`,
            { group_name }
          )
        )
      )
    );

    //create dog breeds, attaching them to their groups w/ relationships (BELONGS-TO)
    await session.executeWrite((tx) =>
      Promise.all(
        breeds.map((breed) =>
          tx.run(
            `
                        MATCH (g:Group)
                        WHERE g.name = $breed_group
                        CREATE (b:Breed {name: $breed_name})-[:BELONGS_TO]->(g)`,
            breed
          )
        )
      )
    );

    const gender = `MERGE (s1:Sex {type: 'F'}) MERGE (s2:Sex {type: 'M'})`
    const size = `MERGE (sz1:Size {category: 'Small'}) MERGE (sz2:Size {category: 'Medium'}) MERGE (sz3:Size {category: 'Large'}) MERGE (sz4:Size {category: 'XLarge'})`;
    const energy = `MERGE (e1:Energy {level: 'Low'}) MERGE (e2:Energy {level: 'Medium'}) MERGE (e3:Energy {level: 'High'})`
    const age = `MERGE (a1:Age {category: 'Puppy'}) MERGE (a2:Age {category: 'Young'}) MERGE (a3:Age {category: 'Adult'}) MERGE (a4:Age {category: 'Senior'})`

    await session.executeWrite((tx) =>
        Promise.all([gender, size, energy, age].map((query) => tx.run(query)))
    );

    
    //create dogs, attaching to their breeds w/relationships (IS-A)
    await session.executeWrite((tx) =>
      Promise.all(
        dogs.map((dog) =>
          tx.run(
            `
                        MATCH (b:Breed {name: $breedName})
                        CREATE (d:Dog)-[:IS_A]->(b)
                        SET d.name = $name, d.username = $username, d.image = $image, d.password = $password, d.email = $email
                        WITH d
                        MATCH(sz:Size {category: $size})
                        MERGE (d)-[r1:IS_SIZE {weight: 0.3}]->(sz)
                        WITH d
                        MATCH(s:Sex {type: $sex})
                        MERGE (d)-[r2:IS_SEX {weight: 0.1}]->(s)
                        WITH d
                        MATCH(e:Energy {level: $energy})
                        MERGE (d)-[r3:HAS_ENERGY {weight: 0.5}]->(e)
                        WITH d
                        MATCH(a:Age {category: $age})
                        MERGE (d)-[r4:IS_AGE {weight: 0.4}]->(a)
                        `, dog
          )
        )
      )
    );

    const weights = {
        'LIKED': 0.7,
        'DISLIKED': -0.7
    }

    await session.executeWrite((tx) => 
        Promise.all(
            relationships.map(({dog1, dog2, rel}) =>
                tx.run(
                    `
                    MATCH (d1:Dog), (d2:Dog)
                    WHERE d1.username = $d1_username AND d2.username = $d2_username
                    MERGE (d1)-[r:${rel} {weight: $weight}]->(d2)
                    `,
                    {d1_name: dog1.name, d1_username: dog1.username, d1_email: dog1.email, d2_name: dog2.name, d2_username: dog2.username, d2_email: dog2.email, weight: weights[rel]}
                ))
        ));

        const q = `
        MATCH (d1:Dog), (d2:Dog)
        WHERE d1 <> d2
        AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        WITH d1, d2
        ORDER BY rand() LIMIT 300
        CREATE (d1)-[:LIKED {weight: 0.5}]->(d2)`

        const q0 = `
        MATCH (d1:Dog), (d2:Dog)
        WHERE d1 <> d2
        AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        WITH d1, d2
        WHERE (d1)-[:IS_A]->(:Breed)<-[:IS_A]-(d2)
        WITH d1, d2
        ORDER BY rand() LIMIT 100
        CREATE (d1)-[:LIKED {weight: 0.5}]->(d2)`

        const q1 = `
        MATCH (d1:Dog)-[r*]->(:Energy)<-[r*]-(d2:Dog)
        WHERE d1 <> d2
        AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        WITH d1, d2
        ORDER BY rand() LIMIT 100
        CREATE (d1)-[r:LIKED {weight: 0.5}]->(d2)`

        const q2 = `
        MATCH (d1:Dog)-[r*]->(:Size)<-[r*]-(d2:Dog)
        WHERE d1 <> d2
        AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        WITH d1, d2
        ORDER BY rand() LIMIT 100
        CREATE (d1)-[r:LIKED {weight: 0.5}]->(d2)`

        const q3 = `
        MATCH (d1:Dog)-[r*]->(:Breed)<-[r*]-(d2:Dog)
        WHERE d1 <> d2
        AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        WITH d1, d2
        ORDER BY rand() LIMIT 100
        CREATE (d1)-[r:LIKED {weight: -0.5}]->(d2)`

        const q4 = `
        MATCH (d1:Dog)-[:LIKED]->(n:Dog)<-[:LIKED]-(d2:Dog)
        WHERE d1 <> d2
        AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        WITH d1, d2
        WHERE (d1)-[:IS_A]->(:Breed)<-[:IS_A]-(d2)
        WITH d1, d2
        ORDER BY rand() LIMIT 100
        CREATE (d1)-[r:LIKED {weight: 0.5}]->(d2)`

        const q5 = `
        MATCH (d1:Dog)-[:LIKED]->(n:Dog)<-[:DISLIKED]-(d2:Dog)
        WHERE d1 <> d2
        AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        WITH d1, d2
        ORDER BY rand() LIMIT 100
        CREATE (d1)-[r:DISLIKED {weight: -0.5}]->(d2)`

        const q6 = `
        MATCH (d1:Dog)-[:LIKED]->(n:Dog)<-[:LIKED]-(d2:Dog)
        WHERE d1 <> d2
        AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        WITH d1, d2
        WHERE (d1)-[:IS_A]->(:Breed)<-[:IS_A]-(d2)
        WITH d1, d2
        ORDER BY rand() LIMIT 100
        CREATE (d1)-[r:LIKED {weight: 0.5}]->(d2)`

        const q7 = `
        MATCH (d1:Dog)-[:DISLIKED]->(n:Dog)<-[:DISLIKED]-(d2:Dog)
        WHERE d1 <> d2
        AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        WITH d1, d2
        WHERE (d1)-[:IS_A]->(:Breed)<-[:IS_A]-(d2)
        WITH d1, d2
        ORDER BY rand() LIMIT 100
        CREATE (d1)-[r:LIKED {weight: 0.5}]->(d2)`

        const q8 = `
        MATCH (d1:Dog)-[:DISLIKED]->(n:Dog)<-[:LIKED]-(d2:Dog)
        WHERE d1 <> d2
        AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        WITH d1, d2
        WHERE (d1)-[:IS_A]->(:Breed)<-[:IS_A]-(d2)
        WITH d1, d2
        ORDER BY rand() LIMIT 100
        CREATE (d1)-[r:LIKED {weight: 0.5}]->(d2)`

        const q9 = `
        MATCH (d1:Dog)-[:HAS_ENERGY]->(:Energy)<-[:HAS_ENERGY]-(d2:Dog)
        WHERE d1 <> d2
        AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        WITH d1, d2
        WHERE (d1)-[:IS_A]->(:Breed)<-[:IS_A]-(d2)
        WITH d1, d2
        ORDER BY rand() LIMIT 100
        CREATE (d1)-[:LIKED {weight: 0.5}]->(d2)`

        const q10 = `
        MATCH (d1:Dog)-[:IS_AGE]->(:Age)<-[:IS_AGE]-(d2:Dog)
        WHERE d1 <> d2
        AND NOT (d1)-[:LIKED|DISLIKED]->(d2)
        WITH d1, d2
        WHERE (d1)-[:IS_A]->(:Breed)<-[:IS_A]-(d2)
        WITH d1, d2
        ORDER BY rand() LIMIT 100
        CREATE (d1)-[:DISLIKED {weight: 0.5}]->(d2)`

        
    
      //   await session.executeWrite((tx) =>
      // Promise.all(
      //   [q].map((query) =>
      //     tx.run(query)
      //   )));

    console.log("Success!");
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
