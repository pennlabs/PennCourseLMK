var api = require("penn-sdk")
Registrar = api.Registrar

var API_USERNAME = "UPENN_OD_endI_1003504"
var API_PASSWORD = "1p5smognls3qbsli6ml50vb97d"

registrar = new Registrar(API_USERNAME, API_PASSWORD)

registrar.search({
  'course_id': 'cis121',
  'term': '2017C'
}, function(result) {
  for (var i = 0; i < result.length; i++) {
    DisplayInfo(result[i])
  }
})

//testing method
var DisplayInfo = (c) => {
  var name = c.section_id_normalized + ": " + c.section_title
  var status = c.is_closed ? "closed" : "open"
  console.log(name)
  console.log("status: " + status)
}
