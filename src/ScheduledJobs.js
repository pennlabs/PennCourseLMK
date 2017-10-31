const ApiServer = require('./ApiServer.js')
const MongoHelper = require('./MongoHelper.js')
const Mailer = require('./Mailer.js')
const Phone = require('./phone.js')

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

// creates a link for users to sign up for a particular course
const createSignupLink = (course, email, phoneEmail) => {
  // check to see if we have an email to add to the link
  let linkEmail = ''
  if (email !== null) { linkEmail = '&email=' + email }
  // check to see if we have a phone/carrier to add to the link
  let linkPhone = ''
  let linkCarrier = ''
  if (phoneEmail !== null) {
    let split = Phone.parsePhoneEmail(phoneEmail)
    linkPhone = '&phone=' + split[0]
    linkCarrier = '&carrier=' + split[1]
  }

  return 'https://penncourselmk.com/?' + 'course=' + course.replace(/ /g, '-') + linkEmail + linkPhone + linkCarrier
}

// -----------Public functions -------------

const SendEmailsToOpenCourses = () => {
  FindEmailsAndCoursesWithOpenings((courseName, backendCourseName, courseEmails) => {
    courseEmails.forEach((emails) => {
      let signupLink = ''
      // if we only have one email, figure out which one and create the appropriate sign up link
      if (emails.length == 1) {
        // if we have a phone email, create sign up link with phone and carrier
        if (Phone.isPhoneEmail(emails[0])) {
          signupLink = createSignupLink(courseName, null, emails[0])
        }
        // otherwise, we have a regular email
        else {
          signupLink = createSignupLink(courseName, emails[0], null)
        }
      }
      // otherwise, we have both email and phone
      else {
        signupLink = createSignupLink(courseName, emails[0], emails[1])
      }
      // send the email with appropriate sign up link
      Mailer.sendEmail(courseName, email, signupLink, (err, message) => {
        if (err) console.log(err)
      })
    })
  })
}

module.exports = {
  SendEmailsToOpenCourses: SendEmailsToOpenCourses,
  FindEmailsAndCoursesWithOpenings: FindEmailsAndCoursesWithOpenings
}