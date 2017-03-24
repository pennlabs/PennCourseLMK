const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const assert = require('assert')
const path = require('path')
const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/penncourselmk'

app.use(bodyParser.urlencoded({extended: true}))
var db

MongoClient.connect(url, (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(3000, () => {
    console.log('listening on 3000')
  })
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/../index.html'))
})

app.post('/submitted', (req, res) => {
  AddEmailToCourse(req.body.course, req.body.email) // Adds email to that course
  GetEmailsFromCourse(req.body.course) // Prints emails for that course
  res.redirect('/')
})


// ------ Helper functions -------
const insertDocuments = function(doc, db, callback) {
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

const findDocuments = function(key, db, callback) {
  const collection = db.collection('documents')
  collection.find({[key]: {$exists: true}}).toArray(function(err, docs) {
    assert.equal(err, null)
    console.log("Found the following records")
    console.log(docs)
    callback(docs);
  })
}

const removeDocument = function(key, db, callback) {
  const collection = db.collection('documents')
  collection.deleteOne({ [key] : {$exists: true}}, function(err, result) {
    callback(result);
  })
}

// ------ Public functions --------
const AddEmailToCourse = function(course, email) {
  const doc = {[course]: email}
  MongoClient.connect(url, function(err, db) {
    insertDocuments(doc, db, function() {
      db.close();
    })
  })
}

const GetEmailsFromCourse = function(course) {
  MongoClient.connect(url, function(err, db) {
      findDocuments(course, db, function() {
        db.close()
      })
  })
}

const RemoveCourse = function(course) {
  MongoClient.connect(url, function(err, db) {
      removeDocument(course, db, function() {
        db.close()
      })
  })
}
