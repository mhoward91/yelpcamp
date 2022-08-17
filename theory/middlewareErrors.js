const express = require('express');
const app = express();
const morgan = require('morgan');
const AppError = require('./appError');
const appError = require('./appError')


app.use(morgan('tiny'));

app.use((req, res, next) => {
    req.requestTime = Date.now();
    console.log(req.method, req.path);
    next();
})

app.get("/error", (req, res) => {
    chicken.fly()
})

app.use('/dogs', (req, res, next) => {
    console.log("I LOVE DOGS!!")
    next();
})

const verifyPassword = (req, res, next) => {
    const { password } = req.query;
    if (password === 'chickennugget') {
        next();
    }
    throw new AppError("password required", 401)
}


// app.use((req, res, next) => {
//     console.log("THIS IS MY FIRST MIDDLEWARE!!!")
//     return next();
//     console.log("THIS IS MY FIRST MIDDLEWARE - AFTER CALLING NEXT()")
// })
// app.use((req, res, next) => {
//     console.log("THIS IS MY SECOND MIDDLEWARE!!!")
//     return next();
// })
// app.use((req, res, next) => {
//     console.log("THIS IS MY THIRD MIDDLEWARE!!!")
//     return next();
// })


app.get('/', (req, res) => {
    console.log(`REQUEST DATE: ${req.requestTime}`)
    res.send('HOME PAGE!')
})

app.get('/dogs', (req, res) => {
    console.log(`REQUEST DATE: ${req.requestTime}`)
    res.send('WOOF WOOF!')
})

app.get('/secret', verifyPassword, (req, res) => {
    res.send('MY SECRET IS: Sometimes I wear headphones in public so I dont have to talk to anyone')
})

app.use((req, res) => {
    res.status(404).send('NOT FOUND!')
})

// custom error function - place at the bottom of other functions
app.use((err, req, res, next) => {
    console.log("*************ERROR**************")
    next(err) // pass the err param to next to pass onto the next error handling middleware (no param calls next middleware)
})

app.listen(3000, () => {
    console.log('App is running on localhost:3000')
})