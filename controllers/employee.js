const Employee = require('../models/employee')
const Attendance = require('../models/attendance')
const date = require('date-and-time')

module.exports.renderLogin = (req, res) => {
    res.render('employee/login')
}

module.exports.login = async (req, res) => {
    const { username } = req.body;
    const employee = await Employee.find({ username })
    req.flash('success', `Welcome ${employee[0].firstName}`)
    // console.log(loged in)
    res.redirect(`/${employee[0]._id}/home`)
}

module.exports.renderRegister = async (req, res) => {
    const employees = await Employee.find({});
    let num = parseInt(employees[employees.length - 1].username)
    num++;
    res.render('employee/register', { employees, num })
}

module.exports.register = async (req, res) => {
    try {
        let isAdmin = false;
        if (req.body.isAdmin === 'on') { isAdmin = true }
        const { firstName, lastName, mobNo, email, password, username, gender, managedby } = req.body;
        const employee = new Employee({ firstName, lastName, mobNo, email, username, gender, isAdmin })
        console.log(managedby)
        if (managedby != 0) {
            const emp = await Employee.findById(managedby)
            //console.log(emp)
            //const employee = new Employee({ firstName, lastName, mobNo, email, username, gender, isAdmin, managedby: emp })
            employee.managedby = emp;
            emp.manages.push(employee);
            await emp.save();
        }
        await Employee.register(employee, password)
        req.flash('success', `${firstName} Successfully Registered`)
        //console.log('employee registered')
        res.redirect('/directory')
    } catch (e) {
        req.flash('error', e.message)
        //console.log(e.message)
        res.redirect('register')
    }
}

module.exports.logout = (req, res) => {
    req.logout();
    //console.log('logged out')
    req.flash('success', 'Logged Out')
    res.redirect('/login')
}

module.exports.directory = async (req, res) => {
    const employees = await Employee.find({}).populate('managedby')
    res.render('employee/directory', { employees })
}

module.exports.edit = async (req, res) => {
    const { eid } = req.params;
    let isAdmin = false;
    if (req.body.isAdmin === 'on') { isAdmin = true }
    const { username, firstName, lastName, mobNo, email, gender, managedby } = req.body
    let employee = await Employee.findById(eid).populate('managedby');
    if (employee.managedby) {
        await Employee.findByIdAndUpdate(employee.managedby._id, { $pull: { manages: eid } })
    }
    if (managedby != 0) {
        const emp = await Employee.findById(managedby)
        employee = await Employee.findByIdAndUpdate(eid, { username, firstName, lastName, mobNo, email, gender, isAdmin, managedby: emp })
        emp.manages.push(employee);
        await emp.save();
    }
    else {
        employee = await Employee.findByIdAndUpdate(eid, { username, firstName, lastName, mobNo, email, gender, isAdmin, managedby: null })
    }
    await employee.save()
    req.flash('success', `Successfully Edited ${firstName} detials`)
    res.redirect('/directory')
}

module.exports.renderEdit = async (req, res) => {
    const { eid } = req.params;
    const employee = await Employee.findById(eid).populate('managedby')
    if (!employee) {
        //console.log('Cannot find that employee')
        req.flash('error', 'Cannot find that employee')
        return res.redirect(`directory`)
    }
    const employees = await Employee.find({});
    res.render('employee/edit', { employees, employee })
}

module.exports.deleteEmployee = async (req, res) => {
    const { id, eid } = req.params;
    if (id === eid) {
        //console.log('you cannot delete your account')
        req.flash('error', 'You cannot delete your account')
        return res.redirect('/directory')
    }
    const employee = await Employee.findById(eid).populate('managedby');
    if (employee.manages.length > 0) {
        //console.log('you cannot delete a Manager')
        req.flash('error', 'You cannot delete a Manager')
        return res.redirect('/directory')
    }
    if (employee.managedby) {
        await Employee.findByIdAndUpdate(employee.managedby._id, { $pull: { manages: eid } })
    }
    for (let attendance of employee.attendances) {
        await Attendance.findByIdAndDelete(attendance);
    }
    await Employee.findByIdAndDelete(eid)
    //console.log('successfully deleted Employee')
    req.flash('success', 'Employee deleted')
    res.redirect(`/directory`);
}

module.exports.renderAttendance = async (req, res) => {
    const { id } = req.params;
    const { eid } = req.query;
    let passId = id;
    if (eid) { passId = eid }
    const employees = await Employee.find({}).populate('attendances').populate('managedby')
    for (let employee of employees) {
        for (let attendance of employee.attendances) {
            attendance.checkInTimeS = '      -'
            attendance.checkOutTimeS = '      -'
            if (attendance.checkInTime)
                attendance.checkInTimeS = date.format(attendance.checkInTime, 'hh:mm:ss A [GMT]Z');
            if (attendance.CheckOutTime)
                attendance.checkOutTimeS = date.format(attendance.CheckOutTime, 'hh:mm:ss A [GMT]Z');
        }
    }
    //console.log(passId)
    res.render('employee/attendance', { employees, passId })
}

module.exports.renderIndex = async (req, res) => {
    const { id } = req.params;
    const employee = await Employee.findById(id).populate('attendances')
    for (let attendance of employee.attendances) {
        attendance.checkInTimeS = '      -'
        attendance.checkOutTimeS = '      -'
        if (attendance.checkInTime)
            attendance.checkInTimeS = date.format(attendance.checkInTime, 'hh:mm:ss A [GMT]Z');
        if (attendance.CheckOutTime)
            attendance.checkOutTimeS = date.format(attendance.CheckOutTime, 'hh:mm:ss A [GMT]Z');
    }
    res.render('index', { employee })
}

module.exports.renderReset = async (req, res) => {
    const { id } = req.params;
    const employee = await Employee.findById(id)
    res.render('employee/password', { employee })
}

module.exports.reset = async (req, res) => {
    const { id } = req.params;
    const { password, repassword } = req.body;
    if (password !== repassword) {
        req.flash('error', "Password didn't match")
        return res.redirect(`/${id}/home`)
    }
    const employee = await Employee.findById(id);
    employee.password = password;
    await employee.save();
    req.flash('success', "Password updated Successfully ");
    res.redirect(`/${id}/home`)
}

module.exports.renderProfile = async (req, res) => {
    const { id } = req.params;
    const employee = await Employee.findById(id).populate('managedby').populate('manages')
    res.render('employee/profile', { employee })
}