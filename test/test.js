const expect = require('chai').expect
const request = require('request') 
const should = require('should')

const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/penncourselmk'
const MongoHelper = require('../src/MongoHelper.js')

describe('Emails in DB', function () {
  it('should add single email to fake course', function (done) {
    MongoHelper.AddEmailToCourse('FAKE-011-111', 'adel@adel.io')
    MongoClient.connect(url, function (err,db) {
      db.collection('emails').findOne({'FAKE-011-111': {$exists:true}}, function (err,doc) {
        let emails = doc['FAKE-011-111']
        let email = emails[0]
        expect(email).to.equal('adel@adel.io')
        done()
      })
    })
  })
})

describe('Emails in DB', function() {
  it('should remove added fake email(s) from course', function (done) {
    MongoHelper.RemoveAllEmailsFromCourse('FAKE-011-111')
    MongoClient.connect(url, function (err,db) {
      db.collection('emails').findOne({'FAKE-011-111': {$exists:true}}, (err,doc) => {
        let emails = doc['FAKE-011-111']
        expect(emails).eql([])
        done()
      })
    })
  })
})

describe('Courses in DB', function () {
  it('should remove fake course', function (done) {
    MongoHelper.RemoveCourse('FAKE-011-111');
    MongoClient.connect(url, function (err,db) {
      db.collection('emails').findOne({'FAKE-011-111': {$exists:true}}, (err,doc) => {
        expect(doc).eql(null)
        done()
      })
    })
  })
})