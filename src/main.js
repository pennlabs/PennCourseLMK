const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const ApiServer = require('./ApiServer.js')
const MongoHelper = require('./MongoHelper.js')
const ScheduledJobs = require('./ScheduledJobs.js')
 
var Schedule = require('node-schedule');

ScheduledJobs.SendEmailsToOpenCourses();

// Schedule.scheduleJob('30 * * * * *', ScheduledJobs.SendEmailsToOpenCourses);

app.use(bodyParser.urlencoded({extended: true}))

app.listen(3000, () => {
  console.log('listening on 3000')
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/../index.html'))
})

app.use(express.static(__dirname + '/js'))

app.post('/submitted', (req, res) => {
  // Checks if course is open
  ApiServer.getCourseInfo(req.body.course, (info) => {
    let testing = true

    if (testing /* !info.open */) {
      MongoHelper.AddEmailToCourse(req.body.course, req.body.email)
      MongoHelper.GetEmailsFromCourse(req.body.course) // Debugging
    } else {
      console.log('course is already open!!!')
    }
    res.redirect('/')
  })
})
