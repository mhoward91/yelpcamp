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

const opts = { toJSON: { virtuals: true } }

const CourseSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [  // embed each review object for each course in the course schema -> one to many relationship
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts)

CourseSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/courses/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

CourseSchema.post("findOneAndDelete", async function (doc) {
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
module.exports = mongoose.model("Course", CourseSchema)