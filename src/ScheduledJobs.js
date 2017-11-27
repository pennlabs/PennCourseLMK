const ApiServer = require('./ApiServer.js')
const MongoHelper = require('./MongoHelper.js')
const Mailer = require('./Mailer.js')
const Phone = require('./phone.js')
const request = require('request')

const domain = 'https://penncoursealert.com/'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// -----------Helper functions -------------
const FindEmailsAndCoursesWithOpenings = (callback) => {
  MongoHelper.GetAllCoursesAndEmails((docs) => {
    docs.forEach((doc) => {
      let backendCourseName = doc.course
      ApiServer.getCourseInfo(backendCourseName, (courseInfo, err) => {
        if (err) {
          // Don't send email if the registrar can't find an associated course.
          console.log(backendCourseName + ' cannot be found.')
          MongoHelper.updateCourseStats(backendCourseName, false)
        } else {
          MongoHelper.getCourse(backendCourseName, course => {
            /*
              Make sure we only send one email PER time the course is open.
              Now, we check what the status of the course was the last time we checked its status.
              If it was false and now it is true, we send the emails. Otherwise,
            */
            if (courseInfo.open && (!course || !course.lastStatus)) {
              let courseEmails = doc.emails
              callback(courseInfo.name, backendCourseName, courseEmails)
            } else {
              // console.log(backendCourseName + ' is still open.')
            }
            MongoHelper.updateCourseStats(backendCourseName, courseInfo.open)
          })
        }
      })
    })
  })
}

// creates a link for users to sign up for a particular course
const createSignupLink = (course, email, phoneEmail, callback) => {
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

  let link = domain + '?' + 'course=' + course.replace(/ /g, '') + linkEmail + linkPhone + linkCarrier
  let options = {
    uri: 'https://www.googleapis.com/urlshortener/v1/url',
    qs: {key: process.env.URL_KEY},
    method: 'POST',
    json: {
      "longUrl": link
    }
  }

  request(options, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      callback && callback(body.id) // Print the shortened url.
    } else {
      // handle error?
    }
  });

}

// -----------Public functions -------------

const SendEmailsToOpenCourses = () => {
  FindEmailsAndCoursesWithOpenings((courseName, backendCourseName, courseEmails) => {
    courseEmails.forEach((emails) => {
      // console.log(emails)
      let signupLink = ''
      // if we only have one email, figure out which one and create the appropriate sign up link
      if (emails.length === 1) {
        // if we have a phone email, create sign up link with phone and carrier
        if (Phone.isPhoneEmail(emails[0])) {
          createSignupLink(backendCourseName, null, emails[0], signupLink => {
            Mailer.sendEmail(courseName, backendCourseName, emails[0], signupLink, true, (err, message) => {
              if (err) console.log(err)
            })
          })
        }
        // otherwise, we have a regular email
        else {
          createSignupLink(backendCourseName, emails[0], null, signupLink => {
            Mailer.sendEmail(courseName, backendCourseName, emails[0], signupLink, false, (err, message) => {
              if (err) console.log(err)
            })
          })
        }
      }
      // otherwise, we have both email and phone
      else {
        createSignupLink(backendCourseName, emails[0], emails[1], signupLink => {
          Mailer.sendEmail(courseName, backendCourseName, emails[0], signupLink, false, (err, message) => {
            if (err) console.log(err)
          })
          Mailer.sendEmail(courseName, backendCourseName, emails[1], signupLink, true, (err, message) => {
            if (err) console.log(err)
          })
        })

      }
      // send the email with appropriate sign up link
    })
  })
}

let importCourses = () => {
  ApiServer.insertCoursesToMongo()
}

module.exports = {
  SendEmailsToOpenCourses: SendEmailsToOpenCourses,
  FindEmailsAndCoursesWithOpenings: FindEmailsAndCoursesWithOpenings,
  importCourses: importCourses
}