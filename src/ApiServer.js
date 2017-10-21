const api = require("penn-sdk")
const request = require('request')
const getCurrentSemester = require("./MongoHelper").GetCurrentSemester
Registrar = api.Registrar

const API_USERNAME = process.env.PENN_SDK_USERNAME
const API_PASSWORD = process.env.PENN_SDK_PASSWORD

registrar = new Registrar(API_USERNAME, API_PASSWORD)

const BASE_URL = 'http://api.penncoursereview.com/v1/depts?token=public'

// Returns {open: boolean, name: String}
const getCourseInfo = (course, callback) => {
  return (
    registrar.search({
      'course_id': course,
      'term': getCurrentSemester()
    }, (result) => {
      const c = result[0]
      if (c) {
        const name = c.section_id_normalized + ": " + c.section_title
        const status = !c.is_closed
        const number = c.course_number
        const section = c.section_number
        callback({'open': status, 'name': name})
      } else {
        callback(null, 'This course doesnt exist!')
      }
    })
  )
}

const getAllCourseInfo = (dept, callback) => {
  return (
    registrar.search({
      'course_id': dept,
      'term': '2017C'
    }, (result) => {
      const c = result
      if (c) {
        let b = []
        c.forEach( (element) => {
          const name = element.section_id_normalized + ": " + element.section_title
          const status = !element.is_closed
          const number = element.course_number
          const section = element.section_number
          const obj =  {'open': status, 'name': name, 'number': number, 'section': section}
          b.push(obj)
        })
      } else {
        console.log('This course doesnt exist!')
      }
      callback(b)
    })
  )
}

const fetchDepartments = (callback) => {
  request(BASE_URL, (err, res, body) => {
    if(err) {
      console.log(err)
    }
    let b = []
    JSON.parse(body)['result']['values'].forEach( (element) => {
      b.push(element['id'])
    })
    callback(b)
  })
}

const getAllCourses = (callback) => {
  let courses = {}
  fetchDepartments( (depts) => {
    depts.forEach( (d) => {
      getAllCourseInfo(d, (e) => courses[d] = e)
    })
  })
  callback(courses)
}

const getCourseScore = (signups, capacity) => {
  let ratio = (signups * 1.0)/capacity
  let score = ratio/0.025;
  let finalScore = ratio | 0;
  if(finalScore > 10) {
    finalScore = 10;
  }
  return finalScore;
}

module.exports = {
  getCourseInfo: getCourseInfo,
  getAllCourseInfo: getAllCourseInfo,
  fetchDepartments: fetchDepartments,
  getAllCourses: getAllCourses
}
