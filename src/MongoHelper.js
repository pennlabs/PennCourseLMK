const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/penncourselmk'

// ------ Helper functions -------
const insertDocuments = (doc, db, callback) => {
  const collection = db.collection('documents')
  const bulk = collection.initializeUnorderedBulkOp()
  const key = Object.keys(doc)[0]
  const val = doc[key]
  bulk.find({[key] : {$exists: true}}).upsert().updateOne({
    $addToSet: {[key]:val}
  })
  bulk.execute()
  callback()
}

const findDocuments = (key, db, callback) => {
  const collection = db.collection('documents')
  collection.find({[key]: {$exists: true}}).toArray((err, docs) => {
    if (err) console.log(err)
    console.log("Found the following records")
    console.log(docs)
    callback(docs);
  })
}

const removeDocument = (key, db, callback) => {
  const collection = db.collection('documents')
  collection.deleteOne({ [key] : {$exists: true}}, (err, result) => {
    if (err) console.log(err)
    callback(result);
  })
}

const findAllDocuments = (db, callback) => {
  const collection = db.collection('documents')
  collection.find().toArray((err, docs) => {
    if (err) console.log(err)
    callback(docs)
  })
}

// ------ Public functions --------
const AddEmailToCourse = (course, email) => {
  const doc = {[course]: email}
  MongoClient.connect(url, (err, db) => {
    if (err) console.log(err)
    insertDocuments(doc, db, () => { db.close() })
  })
}

const GetEmailsFromCourse = (course) => {
  MongoClient.connect(url, (err, db) => {
    if (err) console.log(err)
    findDocuments(course, db, () => { db.close() })
  })
}

const RemoveCourse = (course) => {
  MongoClient.connect(url, (err, db) => {
    if (err) console.log(err)
    removeDocument(course, db, () => { db.close() })
  })
}

const GetAllCoursesAndEmails = (callback) => {
  MongoClient.connect(url, (err,db) => {
    if (err) console.log(err)
    findAllDocuments(db, (docs) => { 
      callback(docs)
      db.close() 
    })
  })
}



module.exports = {
  AddEmailToCourse: AddEmailToCourse,
  GetEmailsFromCourse: GetEmailsFromCourse,
  RemoveCourse: RemoveCourse,
  GetAllCoursesAndEmails: GetAllCoursesAndEmails
}
