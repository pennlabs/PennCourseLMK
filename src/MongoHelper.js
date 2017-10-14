const MongoClient = require('mongodb').MongoClient
let url = 'mongodb://localhost:27017/penncourselmk'

const PRODUCTION_MODE = false
if (PRODUCTION_MODE) {
  url = 'mongodb://pennlabs:' + process.env.LMK_PASSWORD +
  '@ds155080.mlab.com:55080/penncourselmk'
}

// ------ Helper functions -------
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
  MongoClient.connect(url, (err, db) => {
    if (err) console.log(err)
    db.createCollection('emails')
    db.createCollection('analytics')
  })
}

const AddEmailToCourse = (course, email, perpetual) => {
  const doc = {[course]: email}
  MongoClient.connect(url, (err, db) => {
    if (err) console.log(err)
    // insertDocuments(doc, db.collection('emails'), () => { db.close() })
    db.collection('emails').updateOne({email: email, course: course, semester: '2017C'},
      { email: email, course: course, semester: '2017C',
        phone: {
          phoneNumber: '',
          carrier: ''
        },
        sendOnlyOne: perpetual,
        stopEmails: false,
        signupSuccessful: null
      },
      {upsert: true})
  })
}

const GetEmailsFromCourse = (course, callback) => {
  MongoClient.connect(url, (err, db) => {
    if (err) console.log(err)
    // findDocuments(course, db.collection('emails'), () => { db.close() })
    db.collection('emails').find({course: course}).toArray((err, docs) => {
      let es = docs.map(x => x.email)
      console.log(es)
      callback && callback(es)
    })
  })
}

const RemoveCourse = (course) => {
  MongoClient.connect(url, (err, db) => {
    if (err) console.log(err)
    removeDocument(course, db.collection('emails'), () => { db.close() })
  })
}

// Increments the number of times a course has been requested
const IncrementCourseCount = (course) => {
  MongoClient.connect(url, (err, db) => {
    if (err) console.log(err)
    findDocuments(course, db.collection('analytics'), (docs) => {
      const val = docs[0] ? docs[0][course] + 1 : 1
      replaceDocument(course, val, db.collection('analytics'),
        () => { db.close() })
    })
  })
}

const GetAllCoursesAndEmails = (callback) => {
  MongoClient.connect(url, (err,db) => {
    if (err) console.log(err)
    findAllDocuments(db, (docs) => {
      let emails = {}
      for (let i = 0; i < docs.length; i++) {
        let d = docs[i]
        if (d.course in emails) {
          if (!d.stopEmails)
            emails[d.course].push(d.email)
        }
      }
      let r = []
      let o = Object.keys(emails)
      for (let i = 0; i < o.length; i++) {
        r.push({course: o[i], emails: emails[o[i]]})
      }
      callback(r)
      db.close() 
    })
  })
}

const RemoveAllEmailsFromCourse = (course, callback) => {
  MongoClient.connect(url, (err,db) => {
    if (err) console.log(err)
    removeAllFromArrayField(course, db, () => { db.close() })
  })
}

module.exports = {
  CreateCollections: CreateCollections,
  AddEmailToCourse: AddEmailToCourse,
  GetEmailsFromCourse: GetEmailsFromCourse,
  RemoveCourse: RemoveCourse,
  GetAllCoursesAndEmails: GetAllCoursesAndEmails,
  RemoveAllEmailsFromCourse: RemoveAllEmailsFromCourse,
  IncrementCourseCount: IncrementCourseCount
}