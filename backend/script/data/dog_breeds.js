const axios = require("axios");
const { faker } = require("@faker-js/faker");
const fs = require("fs");

const headers = { "x-api-key": process.env.DOG_API_KEY };
//21 = australian cattle dog, ESP = 103, 264 max

const apiHash = {
  1: "affenpinscher",
  4: "airedale",
  6: "akita",
  23: "australian",
  28: "basenji",
  31: "beagle",
  54: "bouvier",
  58: "briard",
  61: "bullterrier",
  81: "chow",
  84: "clumber",
  50: "collie",
  92: "dalmatian",
  94: "doberman",
  110: "finnish",
  115: "germanshepherd",
  127: "greyhound",
  130: "havanese",
  142: "keeshond",
  144: "komondor",
  147: "kuvasz",
  155: "leonberg",
  156: "lhasa",
  161: "maltese",
  171: "newfoundland",
  181: "papillon",
  184: "pembroke",
  201: "pug",
  210: "rottweiler",
  213: "saluki",
  214: "samoyed",
  221: "sheepdog",
  222: "shiba",
  226: "husky",
  251: "vizsla",
  257: "whippet",
  21: "cattledog",
  103: "springer",
};

//seed n dogs to the neo4j database
async function createDogs(n) {
  try {
    let breedIds = Object.keys(apiHash).slice(
      0,
      Object.keys(apiHash).length - 4
    );

    //shuffle the breedIds
    for (let i = breedIds.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [breedIds[i], breedIds[j]] = [breedIds[j], breedIds[i]];
    }

    breedIds = [...breedIds.slice(0, 9), 21, 103];

    //get those dog breeds
    let breeds = await Promise.all(
      breedIds.map((id) => {
        return axios.get(`https://api.thedogapi.com/v1/breeds/${id}`, headers);
      })
    );
    breeds = breeds.map((breed) => breed.data);

    //get the breed groups
    const groups = {};

    breeds.forEach(({ breed_group }) => {
      if (!groups[breed_group] && breed_group !== undefined) {
        groups[breed_group] = true;
      }
    });

    const breedGroups = Object.keys(groups);

    //create a random number of each breed, saving them in arrays
    const dogsNums = Array(breedIds.length).fill(
      Math.floor(n / breedIds.length)
    );

    let emailHash = {};
    let usernameHash = {};
    const dogsByBreed = await Promise.all(
      dogsNums.map((num, i) => {
        return createDogBreedArr(breeds[i], num, emailHash, usernameHash);
      })
    );

    const dogs = dogsByBreed.flat().map(({ weight, energy, age, ...rest }) => {
      let size;
      if (weight < 30) size = "Small";
      else if (weight < 50) size = "Medium";
      else if (weight < 80) size = "Large";
      else size = "XLarge";

      if (energy <= 3) energy = "Low";
      else if (energy <= 6) energy = "Medium";
      else energy = "High";

      if (age < 2) age = "Puppy";
      else if (age < 4) age = "Young";
      else if (age < 9) age = "Adult";
      else age = "Senior";

      return {
        size,
        energy,
        age,
        ...rest,
      };
    });

    const { relationships } = assignRelationships(dogsByBreed.flat());

    return {
      breeds: breeds.map((breed) => {
        return { breed_group: breed.breed_group, breed_name: breed.name };
      }),
      breedGroups,
      dogs,
      relationships,
    };
  } catch (err) {
    console.error(err);
  }
}

async function createDogBreedArr(breed, num, emailHash, usernameHash) {
  let [max, min] = breed.weight.imperial
    .split("-")
    .map((num) => Number(num.trim()));
  if (isNaN(max) || isNaN(min)) {
    max = 50;
    min = 10;
  }
  const maxLifeSpan = Number(breed.life_span.split("-")[0].trim());

  //get images
  let {
    data: { message: images },
  } = await axios.get(`https://dog.ceo/api/breed/${apiHash[breed.id]}/images`);

  //if there aren't enough images for the given breed
  if (images.length < num) {
    //get remaining images from random

    const { data } = await axios.get(
      `https://dog.ceo/api/breed/hound/images/random/${num - images.length}`
    );
    images = images.concat(data.message);
  }

  const dogs = [];
  for (let i = 0; i < num; i++) {
    let age = Math.ceil(Math.random() * maxLifeSpan);
    let energy =
      (age < maxLifeSpan / 3 ? 6 : age < maxLifeSpan / 6 ? 3 : 0) +
      Math.ceil(Math.random() * 3);
    let name = faker.name.firstName();
    let username =
      faker.internet.userName().toLowerCase() + Math.floor(Math.random() * 400);
    let email =
      faker.internet.email().toLowerCase() + Math.floor(Math.random() * 400);

    let image = images[i];
    let weight = Math.max(
      Math.floor(Math.random() * (max - min + 1)) +
        min -
        (maxLifeSpan - age * 1.5),
      3
    );
    const password = name.toLowerCase() + "_pass";
    const sex = ["M", "F"][Math.floor(Math.random() * 2)];

    dogs.push({
      name,
      age,
      energy,
      sex,
      image,
      weight,
      breedName: breed.name,
      username,
      email,
      password,
    });
  }

  return dogs;
}

function assignRelationships(dogs, breeds) {
  //none, disliked, scrolledPast, liked, matched
  const relationships = [];
  const matched = [];

  for (let i = 0; i < dogs.length; i += 6) {
    const dog1 = dogs[i];

    for (let j = i + 1; j < dogs.length; j += 6) {
      const dog2 = dogs[j];

      const [rel1, rel2] = chooseRelationships(dog1, dog2, breeds);

      //0 = none, disliked = 1, scrolledPast = 2, liked=3
      if (rel1 !== "none")
        relationships.push({
          dog2,
          dog1,
          rel: rel1,
        });
      if (rel2 !== "none")
        relationships.push({
          dog2,
          dog1,
          rel: rel2,
        });
    }
  }

  return { relationships, matched };
}

function chooseRelationships(dog1, dog2, breeds) {
  const weights = {
    age: 0.3,
    energy: 0.5,
    sex: 0.1,
    weight: 0.2,
    breed: 0.4,
  };

  let sum = 0;

  //normalize age, weight and energy
  const dog1Normalized = normalize(dog1);
  const dog2Normalized = normalize(dog2);

  for (let trait in weights) {
    let diff = 0;
    if (trait === "sex") diff = dog1[trait] === dog2[trait] ? 0.8 : 0;
    else if (trait === "breed") diff = dog1[trait] === dog2[trait] ? 1 : 0;
    else diff = dog1Normalized[trait] - dog2Normalized[trait];

    sum += weights[trait] * Math.pow(diff, 2);
  }

  const distance = (Math.sqrt(sum) - 0.5) / 0.5;

  return [assignRelationship(distance), assignRelationship(distance)];
}

function normalize(dog) {
  // Define min and max values for each trait
  const minValues = { age: 0, energy: 0, weight: 5 };
  const maxValues = { age: 16, energy: 10, weight: 100 };

  // Normalize each trait value based on min and max values
  const normalizedTraits = {};

  for (let trait in minValues) {
    if (trait !== "id") {
      const traitValue = dog[trait];
      const minValue = minValues[trait];
      const maxValue = maxValues[trait];
      const normalizedValue = (traitValue - minValue) / (maxValue - minValue);
      normalizedTraits[trait] = normalizedValue;
    }
  }

  return normalizedTraits;
}

function assignRelationship(distanceScore) {
  const relProbs = {
    LIKED: 0.4,
    DISLIKED: 0.5,
  };

  let cumulativeProb = 0;
  for (let rel in relProbs) {
    cumulativeProb += relProbs[rel];
    const randomFactor = Math.random() * 0.2 - 0.1;
    if (Math.random() < 0.2) return "LIKED";
    if (distanceScore <= cumulativeProb + randomFactor) {
      return rel;
    }
  }

  //default to none
  return "none";
}

module.exports = createDogs;
