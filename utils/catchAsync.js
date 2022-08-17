// export directly on assignment 
// wraps other functions so it passes any errors in .catch to the middleware error handling function 
// express shorthand - calls next(e) with e = whatever is found in catch
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
}