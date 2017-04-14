const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const path = require('path')
const ApiServer = require('./ApiServer.js')
const MongoHelper = require('./MongoHelper.js')
const courses = require('../courses.json')

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
