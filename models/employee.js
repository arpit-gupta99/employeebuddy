const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose')

const EmployeeSchema = new Schema({
    firstName: String,
    lastName: String,
    mobNo: Number,
    email: String,
    gender: String,
    isAdmin: Boolean,
    attendances: [{
        type: Schema.Types.ObjectId,
        ref: 'Attendance'
    }],
    managedby: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    },
    manages: [{
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    }]
})

EmployeeSchema.plugin(passportLocalMongoose) //it will automatically add username and password to schema

module.exports = mongoose.model('Employee', EmployeeSchema)