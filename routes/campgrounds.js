const express = require("express")
const router = express.Router()
const catchAsync = require("../utils/catchAsync")
const Campground = require("../models/campground")
const campgrounds = require("../controllers/campgrounds")
const ExpressError = require("../utils/expressError")
const { campgroundSchema } = require("../schemas")
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware")

// note callback functions are named in below routes only and defined within the `controllers` dir
// router.route from express used to chain different request types to the same route (e.g. a GET and POST to "/")

// the catchAsync utility fn will pass any errors to the error handling middleware 
// use of third party library joi to do json payload validation on the server side
// invoked through validateCamground middleware function

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

router.get("/new", isLoggedIn, campgrounds.renderNewForm)

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))


router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router

// // the next param is required to call the next middleware function (in this case an error handling middleware function)
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