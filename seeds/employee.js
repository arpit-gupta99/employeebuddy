const mongoose = require('mongoose')
const Employee = require('../models/employee')
const { users } = require('./userdata')

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
    await Employee.deleteMany({});

    // for (let i = 0; i < 5; i++) {
    //     let user = users[i];
    //     const emp = new Employee({
    //         empId: user.empId,
    //         firstName: user.firstName,
    //         lastName: user.lastName,
    //         mobNo: user.mobNo,
    //         mail: user.mail
    //     });

    //     await emp.save();
    // }
}
seedDB()
    .then(() => { mongoose.connection.close(); })