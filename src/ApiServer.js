const api = require("penn-sdk")
const request = require('request')
const getCurrentSemester = require("./MongoHelper").GetCurrentSemester
const MongoHelper = require('./MongoHelper')
Registrar = api.Registrar

const API_USERNAME = process.env.PENN_SDK_USERNAME
const API_PASSWORD = process.env.PENN_SDK_PASSWORD

registrar = new Registrar(API_USERNAME, API_PASSWORD)

const BASE_URL = 'http://api.penncoursereview.com/v1/depts?token=public'

const searchCourse = (params, callback) => {
  const options = {
    url: 'https://esb.isc-seo.upenn.edu/8091/open_data/course_section_search',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization-Bearer': API_USERNAME,
      'Authorization-Token': API_PASSWORD
    },
    method: "GET",
    qs: params
  }

  request(options, (err, resp, body) => {
    if (err) {
      callback(null, err)
    } else {
      // console.log(body)
      try {
        let responseBody = JSON.parse(body)
        let result = responseBody['result_data']
        callback(result, null)
      } catch(e) {
        callback(null, e)
      }
    }
  })
}

// Returns {open: boolean, name: String}
const getCourseInfo = (course, callback) => {
  return (
    searchCourse({
      'course_id': course,
      'term': getCurrentSemester()
    }, (result, err) => {
      if (err) {
        callback(null, err)
      } else {
        const c = result[0]
        if (c) {
          // console.log(c)
          const name = c.section_id_normalized.replace(/\s/g, '') + ": " + c.section_title
          const status = !c.is_closed
          const number = c.course_number
          const section = c.section_number

          const crosslistings = c.crosslistings
          // max_enrollment vs max_enrollment_crosslist
          const max_enrollment = c.max_enrollment

          callback({
            'open': status,
            'normalizedCourse': c.section_id_normalized,
            'name': name,
            'max_enrollment': max_enrollment
          }, null)
        } else {
          callback(null, {message: course + ' does not exist!'})
        }
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

const insertCoursesToMongo = (callback) => {
  console.log('starting course search...')
  // Search all courses for the current semester
  registrar.search({term: getCurrentSemester(), course_id: ''}, courses => {
    console.log('courses query complete!')
    for (let j = 0; j < courses.length; j++) {
      if (courses[j])
        MongoHelper.insertCourse(courses[j])
    }
    callback && callback()
  })
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


module.exports = {
  getCourseInfo: getCourseInfo,
  getAllCourseInfo: getAllCourseInfo,
  fetchDepartments: fetchDepartments,
  getAllCourses: getAllCourses,
  insertCoursesToMongo: insertCoursesToMongo,
}
