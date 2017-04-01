var email = require("emailjs")
var MongoHelper = require("./MongoHelper.js")

var server = email.server.connect({
    user: "penncourselmk@gmail.com",
    password: process.env.LMK_PASSWORD,
    host: "smtp.gmail.com",
    tls: true,
    port: 587
});

var sendEmail = (course, email, callback) => {
	server.send({
	    text: course + " is openn!!!!",
	    from: "Penn Course LMK <penncourselmk@gmail.com>",
	    to: email,
	    subject: course,
	}, function(err, message) { callback( err || message);});
}

module.exports = {
	sendEmail: sendEmail,
}