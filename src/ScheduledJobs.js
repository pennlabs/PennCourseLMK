const ApiServer = require('./ApiServer.js')
const MongoHelper = require('./MongoHelper.js')

// -----------Helper functions -------------
var FindEmailsForCoursessWithOpenings = (callback) => {
  MongoHelper.GetAllCoursesAndEmails((docs) => {
    docs.forEach((doc) => {
      var courseName = Object.keys(doc)[1] 
      ApiServer.GetCourseInfo(courseName, (status) => {
        console.log(status) 
        if (status.open) {
          var courseEmails = doc[courseName]
          callback(courseEmails)
          //send an email to people associated with course
        }
      })
    })
  })
}

module.exports = {
  FindEmailsForCoursessWithOpenings: FindEmailsForCoursessWithOpenings
}