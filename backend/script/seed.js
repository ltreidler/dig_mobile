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

    const { breeds, breedGroups, dogs, relationships, matched } = await createDogs(500);

    console.log(relationships.length, dogs.length);

    //create dog breed groups
    const createdBreedGroups = await session.executeWrite((tx) =>
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
    const createdBreeds = await session.executeWrite((tx) =>
      Promise.all(
        breeds.map((breed) =>
          tx.run(
            `
                        MATCH (g:Group)
                        WHERE g.name = $breed_group
                        CREATE (b:Breed)-[:BELONGS_TO]->(g)
                        SET b.name = $breed_name
                        RETURN b`,
            breed
          )
        )
      )
    );

    //create dogs, attaching to their breeds w/relationships (IS-A)
    const createdDogs = await session.executeWrite((tx) =>
      Promise.all(
        dogs.map((dog) =>
          tx.run(
            `
                        MATCH (b:Breed)
                        WHERE b.name = $breedName
                        CREATE (d:Dog)-[:IS_A]->(b)
                        SET d.name = $name, d.age = $age, d.energy = $energy, d.sex = $sex, d.weight = $weight
                        CREATE (a:Account)-[:CREATED_BY]->(d)
                        SET a.username = $username, a.image = $image, a.password = $password, a.email = $email
                        RETURN d
                        `,
            dog
          )
        )
      )
    );

    const weights = {
        'LIKED': 2,
        'DISLIKED': -2,
        'SCROLLED_PAST': -1
    }

    console.log('timing out');
    await setTimeout(() => {}, 10000);
    console.log('finished timeout');

    await session.executeWrite((tx) => 
        Promise.all(
            relationships.map(({dog1, dog2, rel}) =>
                tx.run(
                    `
                    MATCH (d1:Dog {name: $d1_name, energy: $d1_energy, weight: $d1_weight})
                    MATCH (d2:Dog {name: $d2_name, energy: $d2_energy, weight: $d2_weight})
                    CREATE (d1)-[r:${rel}]->(d2)
                    SET r.weight = $weight
                    `,
                    {d1_name: dog1.name, d1_energy: dog1.energy,   
                        d1_weight: dog1.weight,
                        d2_name: dog2.name, d2_energy: dog2.energy, d2_weight: dog2.weight,
                        weight: weights[rel]
                    }
                ))
        ));

        console.log('timing out');
        await setTimeout(() => {}, 10000);
        console.log('finished timeout');

    // await session.executeWrite((tx) => 
    //     Promise.all(
    //         matched.map(({dog1, dog2}) =>
    //             tx.run(
    //                 `
    //                 MATCH (d1:Dog {name: $d1_name, energy: $d1_energy, weight: $d1_weight})
    //                 MATCH (d2:Dog {name: $d2_name, energy: $d2_energy, weight: $d2_weight})
    //                 MERGE (d1)-[r:MATCHED_WITH]-(d2)
    //                 SET r.weight = $weight
    //                 `,
    //                 {d1_name: dog1.name, d1_energy: dog1.energy,   
    //                     d1_weight: dog1.weight,
    //                     d2_name: dog2.name, d2_energy: dog2.energy, d2_weight: dog2.weight,
    //                     weight: 4
    //                 }
    //             ))
    //     ))

    

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
