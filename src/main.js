const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const MongoHelper = require('./MongoHelper.js')
const ApiServer = require('./ApiServer.js')
const courses = require('../courses.json')
const ScheduledJobs = require('./ScheduledJobs.js')
var Schedule = require('node-schedule')
const Phone = require('./phone.js');

Schedule.scheduleJob('30 * * * * *', ScheduledJobs.SendEmailsToOpenCourses);

app.use(bodyParser.urlencoded({extended: true}))

app.listen(3000, () => {
  console.log('listening on 3000')
  MongoHelper.CreateCollections()
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/../index.html'))
})

app.get('/courses', (req, res) => {
  res.json(courses)
})

app.use(express.static(__dirname + '/js'))

app.post('/submitted', (req, res) => {
  // Checks if course is open
  ApiServer.getCourseInfo(req.body.course, (info) => {
    let testing = true
    console.log(info)
    if (testing /* !info.open */) {
      let sendOnce = false;
      if (req.body.notifications === undefined) {
        sendOnce = true;
      }
      // check if email is present and, if so, add that course to email
      if (req.body.email !== undefined) {
        MongoHelper.AddEmailToCourse(req.body.course, req.body.email, sendOnce);
      }
      // check if phone number & carrier are present and, if so, add that
      // course to phone number associated email
      if (req.body.phonenumber !== undefined && req.body.carrier !== undefined) {
        let phoneEmail = Phone.createTextableEmail(req.body.phonenumber, req.body.carrier);
        MongoHelper.AddEmailToCourse(req.body.course, phoneEmail, sendOnce);
      }
      MongoHelper.GetEmailsFromCourse(req.body.course) // Debugging
      MongoHelper.IncrementCourseCount(req.body.course)
    } else {
      console.log('course is already open!!!')
    }
    res.redirect('/')
  })
})