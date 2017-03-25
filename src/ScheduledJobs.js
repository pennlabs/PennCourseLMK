const ApiServer = require('./ApiServer.js')
const MongoHelper = require('./MongoHelper.js')

// -----------Helper functions -------------
var FindEmailsAndCoursesWithOpenings = (callback) => {
  MongoHelper.GetAllCoursesAndEmails((docs) => {
    docs.forEach((doc) => {
      var courseName = Object.keys(doc)[1] 
      ApiServer.GetCourseInfo(courseName, (courseInfo) => {
        if (courseInfo.open) {
          var courseEmails = doc[courseName]
          callback(courseInfo.name, courseEmails)
        }
      })
    })
  })
}

// -----------Public functions -------------

var SendEmailsToOpenCourses = () => {
  FindEmailsAndCoursesWithOpenings( (courseName, courseEmails) => {
    //going to use emailjs to send out emails to users
    //then need to remove emails from db
    console.log(courseName)
    console.log(courseEmails)
  })
}

module.exports = {
  SendEmailsToOpenCourses: SendEmailsToOpenCourses
}