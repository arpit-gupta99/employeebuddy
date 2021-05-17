const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const Employee = require('./models/employee')
const session = require('express-session')
const employeeRoutes = require('./routes/employee')
const attendanceRoutes = require('./routes/attendance')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const ExpressError = require('./utils/ExpressError')

//connecting to DB
mongoose.connect('mongodb://localhost:27017/employee-management', { useNewUrlParser: true, useUnifiedTopology: true, useUnifiedTopology: true, useFindAndModify: false })
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error"))
db.once("open", () => {
    console.log("Database connected");
});

//ejs-mate for layouts
app.engine('ejs', ejsMate)

//setup for ejs and views path
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

//for POST req.body content
app.use(express.urlencoded({ extended: true }));

//for delete put route
app.use(methodOverride('_method'));

//for setting public directory path
app.use(express.static(path.join(__dirname, 'public')))

//session setup
const sessionconfig = {
    name: 'loginsession', //to change default cookie name
    secret: 'thisissecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionconfig))

//to use flash 
app.use(flash())

//passport setup
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(Employee.authenticate()))

passport.serializeUser(Employee.serializeUser())
passport.deserializeUser(Employee.deserializeUser())

//basic routes
app.use((req, res, next) => {
    //console.log(req.session);
    //console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// app.get('/:id/checkin', (req, res) => {
//     console.log(req.params)
//     res.redirect(`${req.params.id}/home`)
// })

//user routes
app.use('/', employeeRoutes)

//attendance routes
app.use('/:id', attendanceRoutes)

//landing page
app.get('/', (req, res) => {
    res.redirect('/login')
})

//error route
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong';
    res.status(statusCode).render('error', { err })
})

//start listining
app.listen(9999, () => {
    console.log('listening on 9999')
})