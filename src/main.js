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
const favicon = require('serve-favicon');

Schedule.scheduleJob('30 */2 * * * *', ScheduledJobs.SendEmailsToOpenCourses);
Schedule.scheduleJob('0 0 0 15 * *', ScheduledJobs.importCourses) // import courses from registrar once per month


app.use(bodyParser.urlencoded({extended: true}))
app.use(favicon(path.join(__dirname, '../favicon.png')));

MongoHelper.connectDB((err, db) => {
  if (!err) {
    app.listen(process.env.PORT || 3000, () => {
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

app.get('/updatecourses', (req, res) => {
  if (process.env.UPDATEKEY && req.query.code === process.env.UPDATEKEY) {
    ApiServer.insertCoursesToMongo()
    res.send('Courses Updating!')
  } else {
    res.send('Access Denied')
  }
})

app.use(express.static(__dirname + '/js'))


app.get('/stats', (req, res) => {
  MongoHelper.findMaxCourseCount()
    .then(stats => {
      res.send(stats)
    })
})

app.get('/unsubscribe', (req, res) => {
  MongoHelper.deactivateEmail(req.query.course, req.query.email)
  res.send(req.query.email + ' has been unsubscribed from notifications for ' + req.query.course + '. ' +
    'click <a href="/">here</a> to go back to the homepage.')
  // res.sendFile(path.join(__dirname + '/../index.html'))
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
        // console.log(req.body.carrier);
        // console.log(req.body.phone);
        let phoneEmail = Phone.createTextableEmail(req.body.phone, req.body.carrier);
        emails.push(phoneEmail)
      }
      if (emails.length > 0) {
        MongoHelper.AddEmailsToCourse(course, emails, sendOnce)
        // MongoHelper.GetEmailsFromCourse(course) // Debugging
        MongoHelper.IncrementCourseCount(course)
      }
      res.redirect('/?success')
    }
  })
})
