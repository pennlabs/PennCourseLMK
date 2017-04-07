const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/penncourselmk'

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
  collection.deleteOne({[key] : {$exists: true}}, (err, result) => {
    if (err) console.log(err)
    callback(result)
  })
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

module.exports = {
  CreateCollections: CreateCollections,
  AddEmailToCourse: AddEmailToCourse,
  GetEmailsFromCourse: GetEmailsFromCourse,
  RemoveCourse: RemoveCourse,
  IncrementCourseCount: IncrementCourseCount
}
