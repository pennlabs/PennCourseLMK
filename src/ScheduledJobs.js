const ApiServer = require('./ApiServer.js')
const MongoHelper = require('./MongoHelper.js')

// -----------Helper functions -------------
var FindEmailsAndCoursesWithOpenings = (callback) => {
  MongoHelper.GetAllCoursesAndEmails((docs) => {
    docs.forEach((doc) => {
      var backendCourseName = Object.keys(doc)[1] 
      ApiServer.GetCourseInfo(backendCourseName, (courseInfo) => {
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
  FindEmailsAndCoursesWithOpenings( (courseName, courseEmails) => {
    //going to use emailjs to send out emails to users
    //then need to remove emails from db
    console.log('logging')
    console.log(courseName)
    console.log(courseEmails)

    MongoHelper.RemoveAllEmailsFromCourse(courseName)
  })
}

module.exports = {
  SendEmailsToOpenCourses: SendEmailsToOpenCourses
}