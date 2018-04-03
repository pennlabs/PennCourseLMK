const api = require("penn-sdk")
const request = require('request')
const getCurrentSemester = require("./MongoHelper").GetCurrentSemester
const MongoHelper = require('./MongoHelper')
Registrar = api.Registrar

const API_USERNAME = process.env.PENN_SDK_USERNAME
const API_PASSWORD = process.env.PENN_SDK_PASSWORD

registrar = new Registrar(API_USERNAME, API_PASSWORD)

const BASE_URL = 'http://api.penncoursereview.com/v1/depts?token=public'

const createRequestQueue = (key, secret, reqDelay) => {
  let requestQueue = []

  const intervalId = setInterval(() => {
    if (requestQueue.length > 0) {
      const r = requestQueue.shift();
      const options = {
        url: 'https://esb.isc-seo.upenn.edu/8091/open_data/course_section_search',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization-Bearer': key,
          'Authorization-Token': secret
        },
        method: "GET",
        qs: r.query
      }

      console.log(r.query);

      request(options, r.callback)
    } else {
      // console.log('no request')
    }
  }, reqDelay)

  return (req, callback) => {
    requestQueue.push({query: req, callback: callback})
  }
}

const makeRequest = createRequestQueue(API_USERNAME, API_PASSWORD, process.env.RATE_DELAY || 700)

const searchCourse = (params, callback) => {
  makeRequest(params, (err, resp, body) => {
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



const getAllCourseInfo = (results, pageNumber, callback) => {
  makeRequest({
    term: getCurrentSemester(),
    course_id: '',
    page_number: pageNumber
    }, (err, resp, body) => {
      if (err) {
        callback(null, err)
      } else {
        try {
          let responseBody = JSON.parse(body)
          let nextPage = responseBody['service_meta']['next_page_number']
          let newResults = results.concat(responseBody['result_data'])
          if (nextPage > pageNumber) {
            getAllCourseInfo(newResults, nextPage, callback)
          }
          else
            callback(newResults, null);
        } catch(e) {
          callback(null, e)
        }
    }
  })

}

const insertCoursesToMongo = (callback) => {
  console.log('starting course search...')
  // Search all courses for the current semester
  getAllCourseInfo([], 1, courses => {
    console.log('courses query complete!')
    for (let j = 0; j < courses.length; j++) {
      if (courses[j])
        MongoHelper.insertCourse(courses[j])
    }
    callback && callback()
  })
}



module.exports = {
  getCourseInfo: getCourseInfo,
  insertCoursesToMongo: insertCoursesToMongo,
}
