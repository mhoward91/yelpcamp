const express = require("express")
const router = express.Router()
const catchAsync = require("../utils/catchAsync")
const Course = require("../models/course")
const courses = require("../controllers/courses")
const ExpressError = require("../utils/expressError")
const { courseSchema } = require("../schemas")
const { isLoggedIn, validateCourse, isAuthor } = require("../middleware")
const multer = require("multer")
const { storage } =  require("../cloudinary")  // node automatically returns the index.js file in a specified folder
const upload = multer({ storage })

// note callback functions are named in below routes only and defined within the `controllers` dir
// router.route from express used to chain different request types to the same route (e.g. a GET and POST to "/")

// the catchAsync utility fn will pass any errors to the error handling middleware 
// use of third party library joi to do json payload validation on the server side
// invoked through validateCamground middleware function

router.route("/")
    .get(catchAsync(courses.index))
    .post(isLoggedIn, upload.array("image"), validateCourse, catchAsync(courses.createCourse))

router.get("/new", isLoggedIn, courses.renderNewForm)

router.route("/:id")
    .get(catchAsync(courses.showCourse))
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCourse, catchAsync(courses.updateCourse))
    .delete(isLoggedIn, isAuthor, catchAsync(courses.deleteCourse))


router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(courses.renderEditForm))

module.exports = router

// // the next param is required to call the next middleware function (in this case an error handling middleware function)
// // alternative version below shows use of a wrapper function, avoiding using try & catch each time
// app.post("/courses", async (req, res, next) => {
//     try {
//         const course = new Course(req.body.course)
//         await course.save()
//         res.redirect(`/courses/${course._id}`)
//     } catch (e) {
//         next(e)
//     }
// })