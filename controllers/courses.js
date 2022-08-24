// define logic of all query calls -> keep separate from the routes files

const Course = require("../models/course")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

const { cloudinary } = require("../cloudinary")

module.exports.index = async (req, res) => {
    const courses = await
    Course.find({}).populate({
        path: "popupText",
        strictPopulate: false
    })
    res.render("courses/index", { courses })
}

module.exports.renderNewForm = (req, res) => {
    res.render("courses/new")
}

module.exports.createCourse = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.course.location,
        limit: 1
    }).send()
    const course = new Course(req.body.course)
    course.geometry = geoData.body.features[0].geometry
    console.log(course)
    course.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    course.author = req.user._id
    await course.save()
    console.log(course)
    req.flash("success", "Successfully made a new course!")
    res.redirect(`/courses/${course._id}`)
}

module.exports.showCourse = async (req, res) => {
    const course = await Course.findById(req.params.id).populate({
        path: "author",
        strictPopulate: false
    })
    await course.populate({path: "reviews", populate: "author"})
    
    //     path: "reviews",
    //     populate: {
    //         path: "author"
    //     }

    // }).populate("author")
    if (!course) {
        req.flash("error", "That course doesn't exist!")
        res.redirect("/courses")
    } else {
        res.render("courses/show", { course })
    }
}

module.exports.renderEditForm = async (req, res) => {
    const course = await Course.findById(req.params.id)
    if (!course) {
        req.flash("error", "That course doesn't exist!")
        res.redirect("/courses")
    } else {
        res.render("courses/edit", { course })
    }
}

module.exports.updateCourse = async (req, res) => {
    const { id } = req.params
    const course = await Course.findByIdAndUpdate(id, { ...req.body.course })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    course.images.push(...imgs)
    await course.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename)
        }
        await course.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}} })
    }
    req.flash("success", "Successfully updated course!")
    res.redirect(`/courses/${course._id}`)
}

module.exports.deleteCourse = async (req, res) => {
    const { id } = req.params
    await Course.findByIdAndDelete(id)
    req.flash("success", "Successfully deleted course!")
    res.redirect("/courses")
}