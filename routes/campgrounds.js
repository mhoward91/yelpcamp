const express = require("express")
const router = express.Router()
const catchAsync = require("../utils/catchAsync")
const Campground = require("../models/campground")
const ExpressError = require("../utils/expressError")
const { campgroundSchema } = require("../schemas")
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware")


router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}))

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new")
})

router.get("/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author")
    if (!campground) {
        req.flash("error", "That campground doesn't exist!")
        res.redirect("/campgrounds")
    } else {
        res.render("campgrounds/show", { campground })
    }

})

// // next param is required to call the next middleware function (in this case an error handling middleware function)
// // alternative version below shows use of a wrapper function, avoiding using try & catch each time
// app.post("/campgrounds", async (req, res, next) => {
//     try {
//         const campground = new Campground(req.body.campground)
//         await campground.save()
//         res.redirect(`/campgrounds/${campground._id}`)
//     } catch (e) {
//         next(e)
//     }
// })

// the catchAsync utility fn will pass any errors to the error handling middleware 
// use of third party library joi to do json payload validation on the server side
// invoked through validateCamground middleware function
router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    campground.author = req.user._id
    await campground.save()
    req.flash("success", "Successfully made a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash("error", "That campground doesn't exist!")
        res.redirect("/campgrounds")
    } else {
        res.render("campgrounds/edit", { campground })
    }
}))

router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash("success", "Successfully updated campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash("success", "Successfully deleted campground!")
    res.redirect("/campgrounds")
}))

module.exports = router