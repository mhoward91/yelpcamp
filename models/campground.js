const mongoose = require("mongoose")
const review = require("./review")
const Schema = mongoose.Schema


const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual("thumbnail").get(function() {
    return this.url.replace("/upload", "/upload/w_200")
})

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
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