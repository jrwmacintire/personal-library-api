/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
const uuid = require('uuid');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .set('content-type', 'application/json')
          .send({ "title": "Test Book" })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, 'title');
            assert.property(res.body, '_id');
            done();
        })
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .set('content-type', 'application/json')
          .send({ "title": "" })
          .end((err, res) => {
            // console.log(res.body);
            assert.equal(res.status, 200);
            assert.property(res.body, 'error');
            assert.equal(res.body.error, 'Input invalid - empty or false.');
            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function(){

      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end((err, res) => {
            // console.log(res.body);
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'commentcount');
            done();
          });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/' + 'nonsenseinput2030')
          .end((err, res) => {
            // console.log('test');
            assert.equal(res.status, 200);
            assert.property(res.body, 'error');
            assert.equal(res.body.error, 'Book/ID missing from database.')
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        // const testID = uuid().substring(0, 8);
        chai.request(server)
          .get('/api/books/' + 12345678)
          .end((err, res) => {
            // console.log(res.body);
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            assert.property(res.body, 'comments');
            assert.equal(res.body._id, '12345678');
            done();
          });
      });
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .post('/api/books/' + 12345678)
          .send({ "comment": "test comment" })
          .end((err, res) => {
            // console.log(res.body);
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            assert.property(res.body, 'comments');
            assert.equal(res.body._id, '12345678');
            done();
          });
      });
      
    });

  });

});
