var qiniu      = require('./');
var assert     = require('assert');

var bucket = qiniu.testBucket;

describe('qiniu.Batch', function() {

  describe('Batch.stat()', function() {
    it('should get the assets\' stats', function(done) {
      qiniu.batch()
        .stat(bucket.key('gogopher.jpg'))
        .exec(function(err, stat) {
          if (err) {
            throw err;
          }

          done();
        });
    });
  });

  describe('Batch.move()', function() {
    it('should move the asset to another position', function(done) {
      qiniu.batch()
        .move(bucket.key('gogopher.jpg'), bucket.key('gogopher_tmp.jpg'))
        .exec(function(err) {
          if (err) {
            throw err;
          }

          done();
        });
    });
  });

  describe('Batch.copy()', function() {
    it('should make some copies of the assets to the other positions', function(done) {
      qiniu.batch()
        .move(bucket.key('gogopher_tmp.jpg'), bucket.key('gogopher.jpg'))
        .exec(function(err) {
          if (err) {
            throw err;
          }

          done();
        });
    });
  });

  describe('Batch.remove()', function() {
    it('should delete the assets', function(done) {
      qiniu.batch()
        .remove(bucket.key('gogopher_tmp.jpg'))
        .exec(function(err, stat) {
          if (err) {
            throw err;
          }

          done();
        });
    });
  });

});