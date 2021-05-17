const Attendance = require('../models/attendance')
const date = require('date-and-time');
const Employee = require('../models/employee')

module.exports.checkin = async (req, res) => {
    const { id } = req.params;
    const now = new Date();
    //console.log(now)
    const employee = await Employee.findById(id)
    const attendances = await Attendance.find({ eid: employee.username })
    // console.log(employee)
    for (let attendance of attendances) {
        if (date.isSameDay(attendance.date, now)) {
            //console.log('Todays Ateendance already punched')
            req.flash('error', "Today's Attendance already punched")
            return res.redirect(`/${id}/home`)
        }
    }
    const attendance = new Attendance({ status: 'checked In', checkInTime: now, date: now, eid: employee.username, request: 'Pending' })
    if (!employee.managedby) { attendance.request = 'Approved' }
    employee.attendances.push(attendance);
    await attendance.save()
    await employee.save()
    req.flash('success', `Attendance Checked in at ${date.format(now, 'hh:mm:ss A')}`)
    res.redirect(`/${id}/home`)
}

module.exports.checkout = async (req, res) => {
    const { id } = req.params;
    const now = new Date();
    const employee = await Employee.findById(id)
    const attendances = await Attendance.find({ eid: employee.username })
    for (let attendance of attendances) {
        if (date.isSameDay(attendance.date, now)) {
            if (attendance.status === 'checked In') {
                attendance.CheckOutTime = now;
                attendance.status = 'checked Out';
                attendance.request = 'Pending';
                if (!employee.managedby) { attendance.request = 'Approved' }
                const h = date.subtract(now, attendance.checkInTime).toHours()
                const m = (h - Math.floor(h)) * 60
                const s = (m - Math.floor(m)) * 60
                // console.log(Math.floor(h), Math.floor(m), Math.floor(s))
                attendance.totalTime = `${Math.floor(h)}H ${Math.floor(m)}M ${Math.floor(s)}S`
                //console.log('checked out')
                await attendance.save()
                req.flash('success', `Attendance Checked Out at ${date.format(now, 'hh:mm:ss A')}`)
                return res.redirect(`/${id}/home`)
            }
            else {
                //console.log('Todays Ateendance already punched')
                req.flash('error', "Today's Attendance already punched")
                return res.redirect(`/${id}/home`)
            }
        }
    }
    const attendance = new Attendance({ status: 'checked Out', CheckOutTime: now, date: now, eid: employee.username, request: 'Pending' })
    if (!employee.managedby) { attendance.request = 'Approved' }
    employee.attendances.push(attendance);
    await attendance.save()
    await employee.save()
    //console.log('new check out added')
    req.flash('success', `Attendance Checked Out at ${date.format(now, 'hh:mm:ss A ')}`)
    res.redirect(`/${id}/home`)
}

module.exports.onleave = async (req, res) => {
    const { id } = req.params;
    const now = new Date();
    const employee = await Employee.findById(id)
    const attendances = await Attendance.find({ eid: employee.username })
    for (let attendance of attendances) {
        if (date.isSameDay(attendance.date, now)) {
            //console.log('Todays Ateendance already punched')
            req.flash('error', "Today's Attendance already punched")
            return res.redirect(`/${id}/home`)
        }
    }
    const attendance = new Attendance({ status: 'On leave', checkInTime: null, CheckOutTime: null, date: now, eid: employee.username, totalTime: null, request: 'Pending' })
    if (!employee.managedby) { attendance.request = 'Approved' }
    employee.attendances.push(attendance);
    await attendance.save()
    await employee.save()
    //console.log('on leave')
    req.flash('success', `Attendance On Leave for ${date.format(now, 'ddd, MMM DD YYYY')}`)
    res.redirect(`/${id}/home`)
}


module.exports.approve = async (req, res) => {
    const { eid, attid } = req.params;
    const attendance = await Attendance.findById(attid)
    attendance.request = 'Approved';
    await attendance.save()
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
    res.render('employee/attendance', { employees, passId: eid })
}

module.exports.reject = async (req, res) => {
    const { eid, attid } = req.params;
    const attendance = await Attendance.findById(attid)
    attendance.request = 'Rejected';
    await attendance.save()
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
    res.render('employee/attendance', { employees, passId: eid })
}