var qiniu  = require('./');
var fs     = require('fs');
var assert = require('assert');

describe('qiniu.Get', function() {
  
  describe('Bucket.getFile()', function() {
    it('should gets a file with giving a pathname', function(done) {
      
      qiniu.testBucket.getFile('gogopher.jpg', function(err) {
        if (err) {
          throw err;
        }

        done();
      });

    });
  });

  describe('Bucket.createGetStream()', function() {
    it('should gets a file with a stream', function(done) {
      
      var gettingStream = qiniu.testBucket.createGetStream('gogopher.jpg');
      var writingStream = fs.createWriteStream(__dirname + '/assets/gogopher_tmp.jpg');

      gettingStream.pipe(writingStream)
        .on('error', function(err) {
          throw err;
        })
        .on('finish', done);
    });
  });

});