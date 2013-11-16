var qiniu  = require('./');
var fs     = require('fs');   
var assert = require('assert');

var asset = qiniu.testBucket.key('gogopher.jpg');

describe('qiniu.Asset', function() {
  
  describe('Asset.url()', function() {
    it('should return the url of the asset', function() {
      var url = asset.url();

      assert.equal(url, 'http://qiniu-sdk-test.u.qiniudn.com/gogopher.jpg');
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

  describe('Asset.qrcode()', function() {
    it('should return the qrcode image of the asset', function(done) {
      
      // imageView
      asset.qrcode(function(err, data) {
        if (err) {
          throw err;
        }

        fs.writeFile(__dirname + '/assets/gogopher_qrcode.png', data, function(err) {
          done();
        });
      });

    });
  });

  describe('Asset.qrcode().straem()', function() {
    it('should return the qrcode image of the asset by a stream', function(done) {
      
      // imageView Stream
      var qrcodeStream = asset.qrcode().stream();
      var writingStream = fs.createWriteStream(__dirname + '/assets/gogopher_qrcode.png');

      qrcodeStream.pipe(writingStream)
        .on('error', function(err) {
          throw err;
        })
        .on('finish', function() {
          done();
        });
    });
  });

  describe('Asset.md2html()', function() {
    it('should convert Markdown to HTML', function(done) {
      
      qiniu.testBucket.key('sample.md').md2html(function(err, html) {
        if (err) {
          throw err;
        }

        done();
      });
    });
  });

});