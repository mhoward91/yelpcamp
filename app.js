// run mongo on local machine 
const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")  // helps with adding reusable html
const flash = require("connect-flash")
const ExpressError = require("./utils/expressError")
const session = require("express-session")

const campgrounds = require("./routes/campgrounds")  // require campgrounds routes 
const reviews = require("./routes/reviews")  // require reviews routes

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
app.use(express.static(path.join(__dirname, "public")))

// object to configure the session
const sessionConfig = {
    secret: "thishouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// create a session with express-session package -> flash relies on this
app.use(session(sessionConfig))
// enable flash with connect-flash package
app.use(flash())

// flash middleware -> anything flashed under key success is available under res.locals.success for each request - can render as ejs
app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})

// routing -> all routes in campgrounds router (defined in separate file campgrounds.js, should be prefixed with "/campgrounds" 
app.use("/campgrounds", campgrounds)
app.use("/campgrounds/:id/reviews", reviews)

app.get("/", (req, res) => {
    res.render("home")
})

// will run for any request not previously matched
// will pass any error to the error handling middleware with error as the err paraam
app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404))
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

