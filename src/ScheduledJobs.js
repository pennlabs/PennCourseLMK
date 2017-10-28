const ApiServer = require('./ApiServer.js')
const MongoHelper = require('./MongoHelper.js')
const Mailer = require('./Mailer.js')

// -----------Helper functions -------------
const FindEmailsAndCoursesWithOpenings = (callback) => {
  MongoHelper.GetAllCoursesAndEmails((docs) => {
    docs.forEach((doc) => {
      let backendCourseName = doc.course
      ApiServer.getCourseInfo(backendCourseName, (courseInfo) => {
        MongoHelper.getCourse(backendCourseName, course => {
          /*
            Make sure we only send one email PER time the course is open.
            Now, we check what the status of the course was the last time we checked its status.
            If it was false and now it is true, we send the emails. Otherwise,
          */
          if (courseInfo.open && course.lastStatus !== true) {
            let courseEmails = doc.emails
            callback(courseInfo.name, backendCourseName, courseEmails)
          }
          MongoHelper.updateCourseStats(backendCourseName, courseInfo.open)
        })

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