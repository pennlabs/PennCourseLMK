const ApiServer = require('./ApiServer.js')
const MongoHelper = require('./MongoHelper.js')
const Mailer = require('./Mailer.js')

// -----------Helper functions -------------
const FindEmailsAndCoursesWithOpenings = (callback) => {
  MongoHelper.GetAllCoursesAndEmails((docs) => {
    docs.forEach((doc) => {
      let backendCourseName = doc.course
      ApiServer.getCourseInfo(backendCourseName, (courseInfo) => {
        if (courseInfo.open) {
          let courseEmails = doc.emails
          callback(courseInfo.name, backendCourseName, courseEmails)
        }
      })
    })
  })
}

// -----------Public functions -------------

const SendEmailsToOpenCourses = () => {
  FindEmailsAndCoursesWithOpenings( (courseName, backendCourseName, courseEmails) => {
    courseEmails.forEach((email) => {
      Mailer.sendEmail(courseName, email, (err, message) => {
        if (err) console.log(err)
      })
    })
  })
}

module.exports = {
  SendEmailsToOpenCourses: SendEmailsToOpenCourses,
  FindEmailsAndCoursesWithOpenings: FindEmailsAndCoursesWithOpenings
}