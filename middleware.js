const Employee = require('./models/employee')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in')
        //console.log('You must be signed in')
        return res.redirect('/login')
    }
    next()
}

module.exports.isAdmin = async (req, res, next) => {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee.isAdmin) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Only Admin Can do this')
        //console.log('Only Admin Can do this')
        return res.redirect(`/${id}/home`)
    }
    next()
}
