var api = require("penn-sdk")
var request = require('request')
Registrar = api.Registrar

var API_USERNAME = "UPENN_OD_endI_1003504"
var API_PASSWORD = "1p5smognls3qbsli6ml50vb97d"

registrar = new Registrar(API_USERNAME, API_PASSWORD)

const BASE_URL = 'http://api.penncoursereview.com/v1/depts?token=public'

// Returns {closed: boolean, name: String}
var getCourseInfo = (course, callback) => {
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

var getAllCourseInfo = (dept, callback) => {
  return (
    registrar.search({
      'course_id': dept,
      'term': '2017C'
    }, (result) => {
      var c = result
      if (c) {
        b = []
        c.forEach( (element) => {
          var name = element.section_id_normalized + ": " + element.section_title
          var status = !element.is_closed
          var obj =  {'open': status, 'name': name}
          b.push(obj)
        })
      } else {
        console.log('This course doesnt exist!')
      }
      callback(b)
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

// var getAllCourses = (callback) => {
//   fetchDepartments(() => {}).forEach(

//   )
// }

module.exports = {
  getCourseInfo: getCourseInfo,
  getAllCourseInfo: getAllCourseInfo,
  fetchDepartments: fetchDepartments
}
