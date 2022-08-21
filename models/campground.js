const mongoose = require("mongoose")
const review = require("./review")
const Schema = mongoose.Schema

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [  // embed each review object for each campground in the campground schema -> one to many relationship
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
})

CampgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

// compile a mongoose model based on a schema - provide (any) collection name, and the schema
// this creates the model object
module.exports = mongoose.model("Campground", CampgroundSchema)