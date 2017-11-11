const email = require("emailjs")
const MongoHelper = require("./MongoHelper")

const name = 'Penn Course Alert'

// ------ Helper functions ------
const emailText = (course, signupLink) => {
	return `<h1>Penn Course LMK</h1>
	Hello,<br><br>
	The course you requested, ` + course + `, is now open! Hurry and sign up now!<br><br>
	The link to Penn InTouch is <a href="https://pennintouch.apps.upenn.edu/">here</a>.<br><br>
	If you did not get the requested course, you can sign up again <a href="` + signupLink + `">here</a>.<br><br>
	Thank you for using `+name+`!<br><br>
	Sincerely,<br>
	<i>The `+ name +`team</i>`
}

const phoneText = (course, signupLink) => {
  return course + ' is now open! Register on Penn InTouch: http://tiny.cc/lmk\n ' +
    'If you didn\'t get the course, sign up again here: ' + signupLink
}

const server = email.server.connect({
    user: 'penncourselmk@gmail.com',
    password: process.env.LMK_PASSWORD,
    host: 'smtp.gmail.com',
    tls: true,
    port: 587
});

// ------ Public functions ------
const sendEmail = (courseName, courseCode, email, signupLink, isPhoneEmail, callback) => {
	console.log('LMK email sent to ' + email + ' for ' + courseName);
  MongoHelper.updateEmailOptions(courseCode, email)
  if (process.env.MODE === 'prod') {
    let msgText = ''
    if (isPhoneEmail) {msgText = phoneText(courseCode.replace(/\s/g, ''), signupLink)}
    else {msgText = emailText(courseName, signupLink)}

    let d = {
      text: msgText,
      attachment: [{data: msgText, alternative: true}],
      to: email,
      from: 'PennCourseLMK <penncourselmk@gmail.com>'
    }
    if (!isPhoneEmail) {
      d.from = 'Penn Course LMK <penncourselmk@gmail.com>'
      d.subject = courseName + ' is now open!'
    }

    server.send(d, function (err, message) {
      callback(err, message);
    });
  }
}

module.exports = {
	sendEmail: sendEmail,
}