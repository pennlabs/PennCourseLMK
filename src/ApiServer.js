var api = require("penn-sdk")
var request = require('request')
Registrar = api.Registrar

var API_USERNAME = "UPENN_OD_endI_1003504"
var API_PASSWORD = "1p5smognls3qbsli6ml50vb97d"

registrar = new Registrar(API_USERNAME, API_PASSWORD)

const BASE_URL = 'http://api.penncoursereview.com/v1/depts?token=public'

// Returns {closed: boolean, name: String}
var GetCourseInfo = (course, callback) => {
  return (
    registrar.search({
      'course_id': course,
      'term': '2017C'
    }, (result) => {
      var c = result[0]
      if (c) {
        var name = c.section_id_normalized + ": " + c.section_title
        var status = !c.is_closed
        var obj =  {'open': status, 'name': name}
      } else {
        console.log('This course doesnt exist!')
      }
      callback(obj)
    })
  )
}

var fetchDepartments = (callback) => {
  request(BASE_URL, (err, res, body) => {
    if(err) {
      console.log(err)
    }
    b = []
    JSON.parse(body)['result']['values'].forEach( (element) => {
      b.push(element['id'])
    })
    callback(b)
  })
}

module.exports = {
  GetCourseInfo: GetCourseInfo,
  fetchDepartments: fetchDepartments
}
