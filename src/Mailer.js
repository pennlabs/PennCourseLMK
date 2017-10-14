const email = require("emailjs")
const MongoHelper = require("./MongoHelper")


// ------ Helper functions ------
const emailText = (course) => {
	return `<h1>Penn Course LMK</h1>
	Hello,<br><br>
	The course you requested, ` + course + `, is now open! Hurry and sign up now!<br><br>
	The link to Penn InTouch is <a href="https://pennintouch.apps.upenn.edu/">here</a>.<br><br>
	If you did not get the requested course, you can sign up again.<br><br>
	Thank you for using Penn Course LMK!<br><br>
	Sincerely,<br>
	<i>The Penn Course LMK team</i>`
}

const server = email.server.connect({
    user: "penncourselmk@gmail.com",
    password: process.env.LMK_PASSWORD,
    host: "smtp.gmail.com",
    tls: true,
    port: 587
});

// ------ Public functions ------
const sendEmail = (course, email, callback) => {
	console.log('LMK email sent to ' + email + ' for ' + course);
  if (process.env.MODE === 'prod') {
    server.send({
      from: "Penn Course LMK <penncourselmk@gmail.com>",
      to: email,
      subject: course + " is now open!",
      attachment: [{data: emailText(course), alternative: true}]
    }, function (err, message) {
    	MongoHelper.updateEmailOptions(course, email)
      callback(err, message);
    });
  }
}

const sendAllEmails = (course, emails, callback) => {
	emails.forEach((element) => {sendEmail(course,element,callback)})
}

module.exports = {
	sendEmail: sendEmail,
	sendAllEmails: sendAllEmails,
}
