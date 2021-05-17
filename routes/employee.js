const express = require('express')
const router = express.Router()
const passport = require('passport')
const employeeController = require('../controllers/employee')
const { isLoggedIn, isAdmin } = require('../middleware')
const catchAsync = require('../utils/catchAsync')

//login page
router.route('/login')
    .get(employeeController.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), catchAsync(employeeController.login))

//edit or delete employee
router.route('/:id/edit/:eid')
    .get(isLoggedIn, isAdmin, catchAsync(employeeController.renderEdit))
    .delete(isLoggedIn, isAdmin, catchAsync(employeeController.deleteEmployee))
    .put(isLoggedIn, isAdmin, catchAsync(employeeController.edit))

//add user/register page
router.route('/:id/register')
    .get(isLoggedIn, isAdmin, catchAsync(employeeController.renderRegister))
    .post(isLoggedIn, isAdmin, catchAsync(employeeController.register))

//attendance history
router.route('/:id/attendance')
    .get(isLoggedIn, catchAsync(employeeController.renderAttendance))

//logout
router.route('/logout')
    .get(employeeController.logout)

//home page
router.get('/:id/home', isLoggedIn, catchAsync(employeeController.renderIndex))

//Employee Directory
router.get('/directory', isLoggedIn, catchAsync(employeeController.directory))

//password reset page
router.route('/:id/reset')
    .get(isLoggedIn, catchAsync(employeeController.renderReset))
    .post(isLoggedIn, catchAsync(employeeController.reset))

// view profile
router.get('/:id/profile', isLoggedIn, catchAsync(employeeController.renderProfile))

module.exports = router;