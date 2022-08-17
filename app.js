// run mongo on local machine 
const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const Campground = require("./models/campground")  // require created model in mongoose
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")  // helps with adding reusable html
const catchAsync = require("./utils/catchAsync")
const expressError = require("./utils/expressError")
const ExpressError = require("./utils/expressError")
const { campgroundSchema } = require("./schemas")

mongoose.connect("mongodb://localhost:27017/yelp-camp")
    .then(() => {
        console.log("CONNECTION OPEN")
    })
    .catch((err) => {
        console.log(err)
        console.log("OH NO, THERE'S BEEN AN ERROR")
    })

const app = express()

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// middleware -> add next as a param and use next() to call next middleware function
// middleware functions run betweeen the req & res route handler and have access to these objects
// middleware can be specified so it only runs for certain routes
// once res.send or res.render is called, the chain of middleware calls ceases
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/campgrounds", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}))

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new")
})

app.get("/campgrounds/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/show", { campground })
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
app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/edit", { campground })
}))

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
}))

// will run for any request not previously matched
// will pass any error to the error handling middleware with error as the err paraam
app.all("*", (req, res, next) => {
    next(new expressError("Page not found", 404))
})

// error handling -> requires err, req, res, next params for express to identify it as an error handler
// called when next(e) is called from another function
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = "Something went wrong"
    res.status(statusCode).render("error", { err })
    // res.send("Something has gone wrong")
})

app.listen(3000, () => {
    console.log("Serving on port 3000")
})

