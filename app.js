// run mongo on local machine 
const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const Campground = require("./models/campground")  // require created model in mongoose
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")  // helps with adding reusable html

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

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
})

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new")
})

app.get("/campgrounds/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/show", { campground })
})

app.post("/campgrounds", async (req, res) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get("/campgrounds/:id/edit", async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/edit", { campground })
})

app.put("/campgrounds/:id", async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete("/campgrounds/:id", async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
})

app.listen(3000, () => {
    console.log("Serving on port 3000")
})

