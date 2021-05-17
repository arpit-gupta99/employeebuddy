const mongoose = require('mongoose')
const Attendance = require('../models/attendance')

//connecting to DB
mongoose.connect('mongodb://localhost:27017/employee-management', { useNewUrlParser: true, useUnifiedTopology: true, useUnifiedTopology: true, useFindAndModify: false })
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error"))
db.once("open", () => {
    console.log("Database connected");
});

//creating seed data in database
const seedDB = async () => {
    //deleting old records
    await Attendance.deleteMany({});

}
seedDB()
    .then(() => { mongoose.connection.close(); })