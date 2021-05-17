const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const AttendanceSchema = new Schema({
    eid: Number,
    date: Date,
    status: String,
    checkInTime: Date,
    CheckOutTime: Date,
    totalTime: String,
    request: String
})

module.exports = mongoose.model('Attendance', AttendanceSchema)