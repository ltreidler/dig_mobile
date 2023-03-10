const axios = require('axios');
const {faker} = require('@faker-js/faker');

const headers = {'x-api-key': process.env.DOG_API_KEY};
//21 = australian cattle dog, ESP = 103, 264 max

    //query for dog breed: https://api.thedogapi.com/v1/breeds/264

    //query for image: https://api.thedogapi.com/v1/images/search?size=med&breed_ids=21 
    //process.env.DOG_API_KEY
    //x-api-key

//format:


async function createDogs (n) {
    try {
        
        //get some dog breed ids  
        const breedIds = [21, 103, ...Array(Math.floor(n/21)).fill(1).map((el) => Math.floor(Math.random()*263) + el)];

        //get those dog breeds
        let breeds = await Promise.all(breedIds.map(id => {
            return axios.get(`https://api.thedogapi.com/v1/breeds/${id}`, headers);
        }))
        breeds = breeds.map(breed => breed.data);

        console.log(breeds[0].weight.imperial.split('-'))

        //get the breed groups
        const groups = {};

        breeds.forEach(({breed_group}) => {
            if(!groups[breed_group]) {
                groups[breed_group] = true;
            }
        })

        const breedGroups = Object.keys(groups);

        //create a random number of each breed, saving them in arrays
        let count = n;
        const dogsNums = Array(breedIds.length).fill(1).map((el) => {
            let num = Math.floor(Math.random() * count);
            count -= num;
            return num + el;
        });

        const dogsByBreed = await Promise.all(dogsNums.map((num, i) => {
            return createDogBreedArr(breeds[i], num)
        }))

        //return the [breeds, dogs]
        console.log(breeds, breedGroups, dogsByBreed);
        return {breeds, breedGroups, dogsByBreed};
    } catch (err) {
        console.error(err);
    }
    
}


async function createDogBreedArr(breed, num) {
    const weightRange = breed.weight.imperial.split('-').map(weight => Number(weight.trim()));
    const maxLifeSpan = Number(breed.life_span.split('-')[0].trim());
    let {data: images} = await axios.get(`https://api.thedogapi.com/v1/images/search?breed_ids=${breed.id}&limit=${num}`, headers);
    //need to get more images....

    const dogs = [];
    for(let i = 0; i < num; i++) {
        let age = Math.ceil(Math.random() * maxLifeSpan);
        let energy = (age < maxLifeSpan/3 ? 6 : (age < maxLifeSpan/6 ? 3 : 0)) + Math.ceil(Math.random() * 3);
        let name = faker.name.firstName();
        let username = faker.internet.userName(name);
        let email = faker.internet.email(name);
        let image = images[i] ? images[i].url : '';

        dogs.push({
            age,
            energy,
            name,
            username,
            email,
            image
        });
    }


    return dogs;
}

createDogs(500);

module.exports = createDogs;

/*
{
    "weight": {
        "imperial": "44 - 62",
        "metric": "20 - 28"
    },
    "height": {
        "imperial": "17 - 20",
        "metric": "43 - 51"
    },
    "id": 21,
    "name": "Australian Cattle Dog",
    "country_code": "AU",
    "bred_for": "Cattle herding, herding trials",
    "breed_group": "Herding",
    "life_span": "12 - 14 years",
    "temperament": "Cautious, Energetic, Loyal, Obedient, Protective, Brave",
    "reference_image_id": "IBkYVm4v1"
}

*/
