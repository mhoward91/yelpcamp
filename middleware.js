module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl // reroute to the page the user was trying to get to
        req.flash("error", "You must be signed in to complete this action!")
        return res.redirect("/login")
    }
    next()
}