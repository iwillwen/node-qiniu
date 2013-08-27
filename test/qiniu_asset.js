var qiniu      = require('./');
var assert     = require('assert');

var asset = qiniu.testBucket.key('gogopher.jpg');

describe('qiniu.Asset', function() {
  
  describe('Asset.url()', function() {
    it('should return the url of the asset', function() {
      var url = asset.url();

      assert.equal(url, 'http://qiniu-sdk-test.qiniudn.com/gogopher.jpg');
    });
  });

  describe('Asset.entryUrl()', function() {
    it('should return the encoeded entry url of the asset', function() {
      var entryUrl = asset.entryUrl();

      assert.equal(entryUrl, 'cWluaXUtc2RrLXRlc3Q6Z29nb3BoZXIuanBn');
    });
  });

  describe('Asset.stat()', function() {
    it('should get the asset\'s stat', function(done) {
      asset.stat(function(err, stat) {
        if (err) {
          throw err;
        }

        done();
      });
    });
  });

  describe('Asset.move()', function() {
    it('should move the asset to another position', function(done) {
      var dest = qiniu.testBucket.key('gogopher_tmp.jpg');

      asset.move(dest, function(err) {
        if (err) {
          throw err;
        }

        done();
      });
    });
  });

  describe('Asset.copy()', function() {
    it('should make a copy of the asset to another position', function(done) {
      var src = qiniu.testBucket.key('gogopher_tmp.jpg');

      src.copy(asset, function(err) {
        if (err) {
          throw err;
        }

        done();
      });
    });
  });

  describe('Asset.remove()', function() {
    it('should delete the asset', function(done) {
      var tmp = qiniu.testBucket.key('gogopher_tmp.jpg');

      tmp.remove(function(err) {
        if (err) {
          throw err;
        }

        done();
      });
    });
  });

});