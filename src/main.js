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
Schedule.scheduleJob('0 0 0 15 * *', ScheduledJobs.importCourses) // import courses from registrar once per month


app.use(bodyParser.urlencoded({extended: true}))

MongoHelper.connectDB((err, db) => {
  if (!err) {
    app.listen(3000, () => {
      console.log('listening on 3000')
      MongoHelper.CreateCollections()
    })
  }
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/../index.html'))
})

app.get('/courses', (req, res) => {
  MongoHelper.getCourses(req.query.dept, (err, docs) => {
    res.json(docs)
  })
  // res.json(courses)
})

// app.get('/updatecourses', (req, res) => {
//   ApiServer.insertCoursesToMongo()
//   res.send("OK!")
// })

app.use(express.static(__dirname + '/js'))

app.get('/stats', (req, res) => {
  MongoHelper.findMaxCourseCount()
    .then(stats => {
      res.send(stats)
    })
})

app.get('/deactivate', (req, res) => {
  MongoHelper.deactivateEmail(req.query.course, req.query.email)
  res.sendFile(path.join(__dirname + '/../index.html'))
})

app.post('/submitted', (req, res) => {
  // Checks if course is open
  ApiServer.getCourseInfo(req.body.course, (info) => {
    let testing = true
    // console.log(info)
    if (info.open) {
      res.redirect('/?error=courseIsOpen')
    } else {
      // IMPORTANT: Make sure that course code is normalized before inserting into database.
      let course = info.normalizedCourse

      //determine whether user signed up for perpetual notifications or not
      let sendOnce = true;
      if (req.body.notifications) {
        sendOnce = false;
      }

      let emails = []
      // check if email is present and, if so, add that course to email
      if (req.body.email) {
        emails.push(req.body.email)
      }
      // check if phone number & carrier are present and, if so, add that
      // course to phone number associated email
      if (req.body.phone && req.body.carrier) {
        let phoneEmail = Phone.createTextableEmail(req.body.phone, req.body.carrier);
        emails.push(phoneEmail)
      }
      if (emails.length > 0) {
        MongoHelper.AddEmailsToCourse(course, emails, sendOnce)
        // MongoHelper.GetEmailsFromCourse(course) // Debugging
        MongoHelper.IncrementCourseCount(course)
      }
      res.redirect('/')
    }
  })
})