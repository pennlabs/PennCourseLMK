const ApiServer = require('./ApiServer.js')
const MongoHelper = require('./MongoHelper.js')
const Mailer = require('./Mailer.js')

// -----------Helper functions -------------
var FindEmailsAndCoursesWithOpenings = (callback) => {
  MongoHelper.GetAllCoursesAndEmails((docs) => {
    docs.forEach((doc) => {
      var backendCourseName = Object.keys(doc)[1] 
      ApiServer.getCourseInfo(backendCourseName, (courseInfo) => {
        if (courseInfo.open) {
          var courseEmails = doc[backendCourseName]
          callback(courseInfo.name, backendCourseName, courseEmails)
        }
      })
    })
  })
}

// -----------Public functions -------------

var SendEmailsToOpenCourses = () => {
  FindEmailsAndCoursesWithOpenings( (courseName, backendCourseName, courseEmails) => {
    //going to use emailjs to send out emails to users
    //then need to remove emails from db
    console.log('logging')
    console.log(courseName)
    console.log(courseEmails)
    courseEmails.forEach((email) => {
      Mailer.sendEmail(courseName, email, (err, message) => {
        if (err) console.log(err)
      })
    })
    MongoHelper.RemoveAllEmailsFromCourse(backendCourseName)
  })
}

module.exports = {
  SendEmailsToOpenCourses: SendEmailsToOpenCourses
}