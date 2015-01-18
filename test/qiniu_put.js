var qiniu  = require('./');
var fs     = require('fs');
var assert = require('assert');

describe('qiniu.Put', function() {
  
  describe('Bucket.putFile()', function() {
    it('should uploads a file with giving a pathname', function(done) {
      
      qiniu.testBucket.putFile('gogopher.jpg', __dirname + '/assets/gogopher.jpg', function(err, reply) {
        if (err) {
          throw err;
        }

        done();
      });

    });
  });

  describe('Bucket.createPutStream()', function() {
    it('should uploads a file with a stream', function(done) {
      
      var puttingStream = qiniu.testBucket.createPutStream('gogopher.jpg');
      var readingStream = fs.createReadStream(__dirname + '/assets/gogopher.jpg');

      readingStream.pipe(puttingStream)
        .on('error', function(err) {
          throw err;
        })
        .on('end', function() {
          done();
        });
    });
  });

});