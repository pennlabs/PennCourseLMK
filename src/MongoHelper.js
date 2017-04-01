const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/penncourselmk'

// ------ Helper functions -------
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
  collection.deleteOne({ [key] : {$exists: true}}, (err, result) => {
    if (err) console.log(err)
    callback(result)
  })
}

// ------ Public functions --------
const AddEmailToCourse = (course, email) => {
  const doc = {[course]: email}
  MongoClient.connect(url, (err, db) => {
    if (err) console.log(err)
    insertDocuments(doc, db.collection('emails'), () => { db.close() })
  })
}

const GetEmailsFromCourse = (course) => {
  MongoClient.connect(url, (err, db) => {
    if (err) console.log(err)
    findDocuments(course, db.collection('emails'), () => { db.close() })
  })
}

const RemoveCourse = (course) => {
  MongoClient.connect(url, (err, db) => {
    if (err) console.log(err)
    removeDocument(course, db.collection('emails'), () => { db.close() })
  })
}

// Increments the number of times a course has been requested in the analytics
// collection
const IncrementCourseCount = (course) => {
  MongoClient.connect(url, (err, db) => {
    if (err) console.log(err)
    findDocuments(course, db.collection('analytics'), (docs) => {
      const doc = docs[0] ? {[course]: docs[0] + 1} : {[course]: 1}
      console.log(doc)
      insertDocuments(doc, db.collection('analytics'), () => { db.close() })
    })
  })
}

module.exports = {
  AddEmailToCourse: AddEmailToCourse,
  GetEmailsFromCourse: GetEmailsFromCourse,
  RemoveCourse: RemoveCourse
}
