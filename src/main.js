const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const MongoHelper = require('./MongoHelper.js')
const ApiServer = require('./ApiServer.js')
const courses = require('../courses.json')
const ScheduledJobs = require('./ScheduledJobs.js')
var Schedule = require('node-schedule');

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
  if (req.query.q) {
    search_param = req.query.q.toUpperCase()
    var newCourses = courses.filter( (course) => {
      return course.section_id.substring(0,search_param.length) == search_param
    })
    res.json(newCourses)
  } else {
    res.json(courses)
  }
})

app.use('/js', express.static(path.join(__dirname, 'js')))
app.use('/style', express.static(path.join(__dirname, 'style')))

app.post('/submitted', (req, res) => {
  // Checks if course is open
  ApiServer.getCourseInfo(req.body.course, (info) => {
    let testing = true

    if (testing /* !info.open */) {
      MongoHelper.AddEmailToCourse(req.body.course, req.body.email)
      MongoHelper.GetEmailsFromCourse(req.body.course) // Debugging
      MongoHelper.IncrementCourseCount(req.body.course)
    } else {
      console.log('course is already open!!!')
    }
    res.redirect('/')
  })
})
