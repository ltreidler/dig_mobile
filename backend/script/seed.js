const driver = require("../db/db");
const session = driver.session();
const createDogs = require("./data/dog_breeds");

//clear the database
async function clearDb() {
  try {
    await session.executeWrite((tx) => tx.run("MATCH (n) DETACH DELETE n"));
    console.log("Db cleared successfully");
  } catch (err) {
    console.error("Error clearing database:", err);
  }
}

//seed the database
async function seed() {
  try {
    console.log("Clearing db...");
    await clearDb();

    const { breeds, breedGroups, dogs, relationships } = await createDogs(500);

    console.log(`Seeding ${breeds.length} breed and ${dogs.length} dogs!`);

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
                        CREATE (b:Breed {name: $breed_name, weight: 0.5})-[:BELONGS_TO]->(g)`,
            breed
          )
        )
      )
    );

    console.log("seeding traits...");

    const gender = `MERGE (s1:Sex {name: 'F', weight: 0.2}) MERGE (s2:Sex {name: 'M', weight: 0.2})`;
    const size = `MERGE (sz1:Size {name: 'Small', weight: 0.3}) MERGE (sz2:Size {name: 'Medium', weight: 0.3}) MERGE (sz3:Size {name: 'Large', weight: 0.3}) MERGE (sz4:Size {name: 'XLarge', weight: 0.3})`;
    const energy = `MERGE (e1:Energy {name: 'Low', weight: 0.7}) MERGE (e2:Energy {name: 'Medium', weight: 0.7}) MERGE (e3:Energy {name: 'High', weight: 0.7})`;
    const age = `MERGE (a1:Age {name: 'Puppy', weight: 0.6}) MERGE (a2:Age {name: 'Young', weight: 0.6}) MERGE (a3:Age {name: 'Adult', weight: 0.6}) MERGE (a4:Age {name: 'Senior', weight: 0.6})`;

    await session.executeWrite((tx) =>
      Promise.all([gender, size, energy, age].map((query) => tx.run(query)))
    );

    console.log("seeding dogs...");

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
                        MATCH(sz:Size {name: $size})
                        MERGE (d)-[r1:HAS_TRAIT]->(sz)
                        WITH d
                        MATCH(s:Sex {name: $sex})
                        MERGE (d)-[r2:HAS_TRAIT]->(s)
                        WITH d
                        MATCH(e:Energy {name: $energy})
                        MERGE (d)-[r3:HAS_TRAIT]->(e)
                        WITH d
                        MATCH(a:Age {name: $age})
                        MERGE (d)-[r4:HAS_TRAIT ]->(a)
                        `,
            dog
          )
        )
      )
    );

    const weights = {
      LIKED: 0.5,
      DISLIKED: -0.5,
    };

    console.log("seeding relationships...");

    await session.executeWrite((tx) =>
      Promise.all(
        relationships.map(({ dog1, dog2, rel }) =>
          tx.run(
            `
                    MATCH (d1:Dog), (d2:Dog)
                    WHERE d1.username = $d1_username AND d2.username = $d2_username
                    MERGE (d1)-[r:${rel} {weight: $weight}]->(d2)
                    `,
            {
              d1_name: dog1.name,
              d1_username: dog1.username,
              d1_email: dog1.email,
              d2_name: dog2.name,
              d2_username: dog2.username,
              d2_email: dog2.email,
              weight: weights[rel],
            }
          )
        )
      )
    );

    /*
            Helpful cypher queries:

            For adding likes: 
            MATCH (n:Dog)-[]-()-[]-(n2:Dog)
            WHERE NOT n <> n2 AND NOT (n)-[]-(n2)
            WITH rand() as rand, n, r, n2
            ORDER BY rand
            LIMIT 100
            MERGE (n)-[:LIKED]->(n2)

            For adding frienships: 
            MATCH (n:Dog)-[r:LIKED]->(n2:Dog)
            WHERE NOT (n2)-[r:LIKED|DISLIKED|FRIENDS_WITH]->(n)
            AND NOT (n)-[:FRIENDS_WITH]->(n2)
            WITH n, r, n2, rand() AS rand
            DELETE r
            MERGE (n)-[:FRIENDS_WITH]-(n2)
            ORDER BY rand
            LIMIT 20

            For adding friendships:
            MATCH (d)-[r:LIKED]->(d2) OPTIONAL MATCH (d2)-[r2:LIKED]->(d) WITH d, r, d2, r2 ORDER BY rand() LIMIT 200 DELETE r, r2 WITH d, d2 MERGE (d)-[:FRIENDS_WITH]-(d2)

            For updating saw:
            MATCH ()-[r:SAW]->() DELETE r

            For finding popular dogs:
            MATCH (n2)-[r:LIKED]->(n) WHERE NOT (n)-[:LIKED|DISLIKED]->(n2) WITH count(DISTINCT n2) AS ct, n ORDER BY ct DESC LIMIT 10 RETURN n, ct

    */

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
