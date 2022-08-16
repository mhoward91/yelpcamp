const mongoose = require("mongoose")
const Schema = mongoose.Schema

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String
})

// compile a mongoose model based on a schema - provide (any) collection name, and the schema
// this creates the model object
module.exports = mongoose.model("Campground", CampgroundSchema)