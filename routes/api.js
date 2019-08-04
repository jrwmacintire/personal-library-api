/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
const uuid = require('uuid/v4');
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
module.exports = function (app) {
    // console.log('Connected to database!');
    
    app.route('/api/books')
      .get(function (req, res, next){
        //response will be array of book objects
        //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
        // res.json({ "title": "test_message - GET at '/api/books'" });
      
        MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (connectErr, client) => {
          if(connectErr) res.json({ "error": "Error connecting to database!", "error": connectErr });
          const db = client.db('test-db');
          
          try {
            db.collection('testCollection')
              .find({})
              .toArray((filesErr, files) => {
                if(filesErr) throw filesErr;
                else {
                  const booksWithCommentcount = files.map(file => {
                    return {
                      title: file.title,
                      _id: file._id,
                      commentcount: file.comments.length || 0
                    };
                  });
                  res.json(booksWithCommentcount);
                }
              });
          } catch(err) {
            next(err);
          }
          
        });
      })
      
      .post(function (req, res, next){
        var title = req.body.title;
        //response will contain new book object including atleast _id and title
      
        if(title) {
          // res.json({ title: title });
          try {
            MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (connectErr, client) => {
              if(connectErr) next(err);
              
              const db = client.db('test-db');
              const newBookJson = { 
                title: title,
                _id: uuid().substring(0, 8),
                comments: []
              };
              
              try {
                db.collection('testCollection').insertOne(newBookJson, (insertErr, doc) => {
                  if(insertErr) throw insertErr;
                  else {
                    // res.json(doc.ops);
                    res.json({
                      title: doc.ops[0].title,
                      _id: doc.ops[0]._id
                    });
                  }
                });
              } catch(err) {
                console.log('Failed to insert new book into DB', err);
                throw err;
              }
              
            });
          } catch(err) {
            console.log('Failed to connect to database...', err);
            throw err;
          } 
        } else {
          res.json({ "error": "Input invalid - empty or false." });
        }
      })
      
      .delete(function(req, res, next){
        //if successful response will be 'complete delete successful'
        console.log('deleting all documents');
        MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (connectErr, client) => {
          if(connectErr) next(connectErr);
          const db = client.db('test-db');
          try {
            db.collection('testCollection2').deleteMany({}, (err) => {
              if(err) throw err;
              res.send('complete delete successful');
              console.log('complete delete successful');
            });
          } catch(err) {
            console.log('Complete delete failed!');
            res.send('Complete delete failed!');
          }
        });
      });


    
    app.route('/api/books/:id')
      .get(function (req, res, next){
      
        var bookid = req.params.id;
        //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      
        if(bookid) {
          // console.log('bookid found, check database');
          
          MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (connectErr, client) => {
            if(connectErr) next(connectErr);
            const db = client.db('test-db');
            db.collection('testCollection').findOne({ _id: bookid }, (findErr, file) => {
              if(findErr) next(findErr);
              // console.log(file);
              if(file) {
                // console.log(`found file w/ ID: '${bookid}'`, file);
                res.json(file);
              } else {
                res.json({ error: `Book/ID missing from database.` });
              }
            });
          });
          
        } else {
          
          console.log('No input given for ID');
          res.json({ error: 'No input given for ID' });
          
        }
      })
      
      .post(function(req, res){
      
        var bookid = req.params.id;
        var comment = req.body.comment;
      
        if(bookid && comment) {
          
          MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (connectErr, client) => {
            
            if(connectErr) res.json({ "error": "Error connecting to database!", "error": connectErr });
            const db = client.db('test-db');
            
            try {
              db.collection('testCollection').findOneAndUpdate({ _id: bookid }, { $push: {comments: comment} }, (err, file) => {
                if(err) res.json({ error: err });
                // console.log('updating file:', file.value);
                if(!file.value) res.send('Failed to find that book ID');
                else res.json(file.value);
              });
            } catch(err) {
              console.log(err);
              res.json({ error: 'Error updating the file with a new comment.' });
            }
            
          });
        } else {
          res.json({ error: 'Missing input for bookid or comment.' });
        }
      })
      
      .delete(function(req, res){
        var bookid = req.params.id;
        //if successful response will be 'delete successful'
      
        MongoClient.connect(MONGODB_CONNECTION_STRING, { useNewUrlParser: true }, (connectErr, client) => {
            
          if(connectErr) res.json({ "error": "Error connecting to database!", "error": connectErr });
          const db = client.db('test-db');
          
          try {
            db.collection('testCollection').deleteOne({ _id: bookid });
            res.send('delete successful');
          } catch(err) {
            console.log(err);
            res.json({ error: 'Error deleting a book.' });
          }
          
        });
      });
    
  
};
