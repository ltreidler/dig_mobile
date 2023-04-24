const neo4j = require("neo4j-driver");
require("dotenv").config();

//set up the connection to the database
const driver = neo4j.driver(
  process.env.DB_URI,
  neo4j.auth.basic("neo4j", process.env.DB_PASSWORD)
);

module.exports = driver;
