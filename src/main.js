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

app.get('/stats', (req, res) => {
  MongoHelper.findMaxCourseCount()
    .then(stats => {
      res.send(stats)
    })
})

app.post('/submitted', (req, res) => {
  // Checks if course is open
  ApiServer.getCourseInfo(req.body.course, (info) => {
    let testing = true
    // console.log(info)
    if (testing /* !info.open */) {
      // IMPORTANT: Make sure that course code is normalized before inserting into database.
      let course = info.normalizedCourse

      //determine whether user signed up for perpetual notifications or not
      let sendOnce = true;
      if (req.body.notifications) {
        sendOnce = false;
      }
      // check if email is present and, if so, add that course to email
      if (req.body.email) {
        MongoHelper.AddEmailToCourse(course, req.body.email, sendOnce);
      }
      // check if phone number & carrier are present and, if so, add that
      // course to phone number associated email
      if (req.body.phone && req.body.carrier) {
        let phoneEmail = Phone.createTextableEmail(req.body.phone, req.body.carrier);
        MongoHelper.AddEmailToCourse(course, phoneEmail, sendOnce);
      }
      MongoHelper.GetEmailsFromCourse(course) // Debugging
      MongoHelper.IncrementCourseCount(course)
    } else {
      console.log('course is already open!!!')
    }
    res.redirect('/')
  })
})