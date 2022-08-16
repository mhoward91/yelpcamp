// execute this file to seed data following model changes

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect("mongodb://localhost:27017/yelp-camp")
    .then(() => {
        console.log("CONNECTION OPEN")
    })
    .catch((err) => {
        console.log(err)
        console.log("OH NO, THERE'S BEEN AN ERROR")
    })


const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});  // delete existing data
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 40) + 10
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: "https://source.unsplash.com/collection/483251",
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Explicabo laborum recusandae possimus laboriosam soluta reprehenderit tempora nihil expedita sed odit fuga eos, ipsum aut hic corporis harum rem? Excepturi, quasi!Iste, placeat. Voluptates nostrum eaque sint possimus, dolore architecto maiores, inventore commodi ipsum at placeat id, odit nesciunt eius reiciendis culpa. Harum voluptatibus id debitis aperiam vel voluptate saepe inventore.",
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})