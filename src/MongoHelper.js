const MongoClient = require('mongodb').MongoClient
let url = 'mongodb://localhost:27017/penncourselmk'

const PRODUCTION_MODE = false
if (PRODUCTION_MODE) {
  url = 'mongodb://pennlabs:' + process.env.LMK_PASSWORD +
  '@ds155080.mlab.com:55080/penncourselmk'
}

// TODO: Connection Pooling
// ------ Helper functions -------

// Get current semester code
const GetCurrentSemester = () => {
  let d = new Date()
  let year = d.getYear() + 1900
  switch(d.getMonth()) {
    case 10: // November
    case 11: // December
      return (year+1)+'A'
    case 0: // January
    case 1: // February
      return year + 'A'
    case 2: // March
    case 3: // April
    case 4: // May
    case 5: // June
      // return year+'B' // summer session
    case 6: // July
    case 7: // August
    case 8: // September
    case 9: // October
      return year+'C'
  }

}

let db = null

const connectDB = (callback) => {
  MongoClient.connect(url, (err, db1) => {
    if (err) callback(err, db1)

    db = db1
    callback(err, db1)
  })
}



// Inserts doc into the set with its key if exists, adds doc if doesn't exist
const insertDocuments = (doc, collection, callback) => {
  const bulk = collection.initializeUnorderedBulkOp()
  const key = Object.keys(doc)[0]
  const val = doc[key]
  bulk.find({[key] : {$exists: true}}).upsert().updateOne({
    $addToSet: {[key]:val}
  })
  bulk.execute()
  callback()
}

const findDocuments = (key, collection, callback) => {
  collection.find({[key]: {$exists: true}}).toArray((err, docs) => {
    if (err) console.log(err)
    console.log("Found the following records")
    console.log(docs)
    callback(docs)
  })
}

const removeDocument = (key, collection, callback) => {
  collection.deleteAll({[key] : {$exists: true}}, (err, result) => {
    if (err) console.log(err)
    callback(result)
  })
}

const findAllDocuments = (db, callback) => {
  const collection = db.collection('emails')
  collection.find().toArray((err, docs) => {
    if (err) console.log(err)
    callback(docs)
  })
}

const removeAllFromArrayField = (key, db, callback) => {
  const collection = db.collection('emails')
  collection.update(
    {[key]: {$exists: true}},
    {$set: { [key] : [] }}
  ).catch((e) => {
    console.log(e)
  });
}
// Relaces the value of the document with given key with the new val
const replaceDocument = (key, val, collection, callback) => {
  collection.replaceOne(
    {[key] : {$exists: true}},
    {[key] : val},
    {upsert: true},
    (err, result) => {
      if (err) console.log(err)
      callback(result)
    })
}

// ------ Public functions --------
const CreateCollections = () => {
  db.createCollection('emails')
  db.createCollection('analytics')
}

const AddEmailsToCourse = (course, emails, perpetual) => {
  db.collection('emails').updateOne({emails: emails, course: course, semester: GetCurrentSemester()},
    { emails: emails, course: course, semester: GetCurrentSemester(),
      sendOnlyOne: perpetual,
      stopEmails: false,
      signupSuccessful: null
    },
    {upsert: true})
}

const GetEmailsFromCourse = (course, callback) => {
  db.collection('emails').find({course: course}).toArray((err, docs) => {
    let es = docs.map(x => x.email)
    console.log(es)
    callback && callback(es)
  })
}

const RemoveCourse = (course) => {
  removeDocument(course, db.collection('emails'), () => {})
}

// Increments the number of times a course has been requested
const IncrementCourseCount = (course) => {
  db.collection('analytics').updateMany(
    {course: course, semester: GetCurrentSemester()},
    {$inc: {count: 1}, $set: {course: course, semester: GetCurrentSemester()}},
    {upsert: true})
}

const findMaxCourseCount = () => {
  return new Promise((resolve, reject) => {
    db.collection('analytics').aggregate(
      [
        {
          $group: {
            _id: "$semester",
            maxRegistrations: {$max: "$count"}
          }
        }
      ],
      function(err, res) {
        if (err) reject(err)

        let r = {}
        for (let i = 0; i < res.length; i++) {
          let o = res[i]
          r[o._id] = o.maxRegistrations
        }
        resolve(r)
      }
    )
    }
  )
}

const updateEmailOptions = (course, email) => {
  const q = {course: course, emails: email, sendOnlyOne: true, stopEmails: false, semester: GetCurrentSemester()}
  db.collection('emails').updateOne(
    q,
    {$set: {stopEmails: true}}).then(x => console.log(x.result))
}

const updateCourseStats = (course, isOpen) => {
  const now = new Date()
  db.collection('analytics').updateOne(
    {course: course, semester: GetCurrentSemester()},
    {$set: {lastUpdated: now, lastStatus: isOpen}})
}

const getCourse = (course, cb) => {
  db.collection('analytics').findOne({course: course, semester: GetCurrentSemester()}, (err, doc) => {
    cb && cb(doc)
  })
}
const deactivateEmail = (course, email) => {
  db.collection('emails').updateOne(
    {course: course, email: email, sendOnlyOne: false, stopEmails: false, semester: GetCurrentSemester()},
    {stopEmails: true})
}

const GetEmailsFromCoursesQuery = (docs) => {
  /**
   * Collect emails from MongoDB documents into the proper form to send-out in emails.
   * We check if the course is open, and then passes on the list of all the associated
   * emails to the mailer
   *
   * @type {{course: <string>, emails: <string list list>}}
   */
  let emails = {}
  // get all the emails associated with a course
  for (let i = 0; i < docs.length; i++) {
    let doc = docs[i]
    if (!(doc.course in emails)) {
      emails[doc.course] = []
    }
    emails[doc.course].push(doc.emails)
  }
  let o = Object.keys(emails)
  return o.map(c => {return {course: c, emails: emails[c]}})
}

const collectEmailsToSend = (callback) => {
  // Only query emails for the current semester where they should still be sent emails.
  db.collection('emails').find({stopEmails: false, semester: GetCurrentSemester()}).toArray((err, docs) => {
    if (err) console.log (err)
    else {
      let r = GetEmailsFromCoursesQuery(docs)
      callback(r)
    }
  })
}

const RemoveAllEmailsFromCourse = (course, callback) => {
  removeAllFromArrayField(course, db, () => { })
}

const insertCourse = (course) => {
  let c = {
    section_id: course.section_id_normalized.replace(/\s/g, ''),
    course: course.section_id_normalized.replace(/\s/g, ''),
    course_title: course.course_title,
    instructors: course.instructors.map(x => x.name),
    meetings_days: course.meetings.map(m => m.meeting_days + ' ' + m.start_time + ' - ' + m.end_time),
    capacity: course.max_enrollment,
    semester: GetCurrentSemester(),
  }
  db.collection('courses').updateOne(
    {section_id: c.section_id, semester: c.semester},
    c,
    {upsert: true}
  )
}

const getCourseScore = (signups, capacity) => {
  let ratio = (signups * 1.0)/capacity
  let score = ratio/0.025;
  let finalScore = score | 0;
  if(finalScore > 10) {
    finalScore = 10;
  }
  return finalScore;
}

const getCourses = (section, callback) => {
  let q = {semester: GetCurrentSemester()}
  if (section) q.section_id = new RegExp('^'+section)
  db.collection('courses').aggregate([
    {
      $match: q
    },
    {
      $lookup: {
        from: 'analytics',
        localField: 'course',
        foreignField: 'course',
        as: 'analytics'
      }
    }
  ], (err, res) => {
    callback(err, res.map(course => {
      if (course.analytics.length > 0)
        course['demand'] = getCourseScore(course.analytics[0].count, course.capacity)
      else
        course['demand'] = 0

      course.section_id = course.section_id.replace(/ /g, '')
      return course
    }))
  })
}

const updateDept = (dept) => {
  db.collection('departments').updateOne(
    {dept: dept, semester: GetCurrentSemester()},
    {$set: {dept: dept, semester: GetCurrentSemester(), lastUpdated: new Date()}},
    {upsert: true})
}

module.exports = {
  CreateCollections: CreateCollections,
  AddEmailsToCourse: AddEmailsToCourse,
  GetEmailsFromCourse: GetEmailsFromCourse,
  RemoveCourse: RemoveCourse,
  GetAllCoursesAndEmails: collectEmailsToSend,
  RemoveAllEmailsFromCourse: RemoveAllEmailsFromCourse,
  IncrementCourseCount: IncrementCourseCount,
  updateEmailOptions: updateEmailOptions,
  GetCurrentSemester: GetCurrentSemester,
  findMaxCourseCount: findMaxCourseCount,
  insertCourse : insertCourse,
  updateDept: updateDept,
  updateCourseStats: updateCourseStats,
  getCourse: getCourse,
  deactivateEmail: deactivateEmail,
  connectDB: connectDB,
  getCourses: getCourses,
}