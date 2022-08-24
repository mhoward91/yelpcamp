// run mongo on local machine 

// access locally stored environment variables from .env file if app not in production
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")  // helps with adding reusable html
const flash = require("connect-flash")
const ExpressError = require("./utils/expressError")
const session = require("express-session")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")

const mongoSanitize = require("express-mongo-sanitize")

const userRoutes = require("./routes/users")
const campgroundRoutes = require("./routes/campgrounds")  // require campgrounds routes 
const reviewRoutes = require("./routes/reviews")  // require reviews routes

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp"

const MongoDBStore = require("connect-mongo")(session)

mongoose.connect(dbUrl) // local mongo connection
// mongoose.connect(dbUrl) // atlas (cloud) mongo connection
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
app.use(mongoSanitize())

const secret = process.env.SECRET || "thisshouldbeabettersecret!"

// config to setup session store in mongo atlas
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})


// object to configure the session
const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// create a session with express-session package -> flash relies on this.
app.use(session(sessionConfig))
// enable flash with connect-flash package
app.use(flash())

// config code for passport (authentication)
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// flash middleware -> anything flashed under key success is available under res.locals.success for each request - can render as ejs
app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})

// routing -> all routes in campgrounds router (defined in separate file campgrounds.js, should be prefixed with "/campgrounds" 
app.use("/", userRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)

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

