var email = require("emailjs")

var server = email.server.connect({
    user: "penncourselmk@gmail.com",
    password: process.env.LMK_PASSWORD,
    host: "smtp.gmail.com",
    tls: true,
    port: 587
});

server.send({
    text: "stat 430 is openn!!!!",
    from: "Penn Course LMK <penncourselmk@gmail.com>",
    to: "Brandon <blin1283@gmail.com>",
    subject: "stat 430"
}, function(err, message) { console.log( err || message);});
