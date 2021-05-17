const express = require('express')
const router = express.Router({ mergeParams: true })
const attendanceController = require('../controllers/attendance')
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, isAdmin } = require('../middleware')

router.get('/checkin', isLoggedIn, catchAsync(attendanceController.checkin))

router.get('/checkout', isLoggedIn, catchAsync(attendanceController.checkout))

router.get('/onleave', isLoggedIn, catchAsync(attendanceController.onleave))

router.get('/approve/:eid/:attid', isLoggedIn, catchAsync(attendanceController.approve))

router.get('/reject/:eid/:attid', isLoggedIn, catchAsync(attendanceController.reject))

module.exports = router;