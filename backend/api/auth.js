const router = require("express").Router();
const driver = require("../db/db");

//route to log in
//recieves a username and password
//sends back the dog's information
router.put("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const session = driver.session();

    const query = `
        MATCH (dog:Dog {username: $username, password: $password})
        WITH dog
        MATCH (dog)-[]->(trait)
        WHERE NOT labels(trait)[0] = 'Dog'
        RETURN dog.username AS username, dog.name AS name, id(dog) AS id, dog.image AS image, collect(trait.name) AS traits, collect(labels(trait)[0]) AS trait_labels`;

    let data = await session.executeWrite((tx) =>
      tx.run(query, { username, password })
    );

    if (!data || !data.records.length) throw new Error("Dog not found");

    record = data.records[0];

    const details = {};

    const traits = record.get("traits");
    for (let i = 0; i < traits.length; i++) {
      details[record.get("trait_labels")[i].toLowerCase()] = traits[i];
    }

    const dog = {
      id: record.get("id").toNumber(),
      username: record.get("username"),
      image: record.get("image"),
      name: record.get("name"),
      ...details,
    };

    res.send(dog);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
