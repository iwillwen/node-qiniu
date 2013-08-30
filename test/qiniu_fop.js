var qiniu      = require('./');
var fs         = require('fs');
var dataStream = require('dataStream');
var assert     = require('assert');

var asset = qiniu.testBucket.key('gogopher.jpg');

describe('qiniu.Asset.Fop', function() {
  
  describe('Fop.imageInfo()', function() {
    it('should return some infomations of a picture', function(done) {
      
      asset.fop()
        .imageInfo()
        .exec(function(err, data) {
          if (err) {
            throw err;
          }

          done();
        });

    });
  });

  describe('Fop.exif()', function() {
    it('should return the exif infomation of a picture', function(done) {
      
      asset.fop()
        .exif()
        .exec(function(err) {
          if (err) {
            throw err;
          }

          done();
        });

    });
  });

  describe('Fop.imageView()', function() {
    it('should return a thumbnail asset', function(done) {
      
      // imageView
      asset.fop()
        .imageView({
          mode    : 2,
          width   : 180,
          height  : 180,
          quality : 85,
          format  : 'jpg'
        })
        .exec(function(err, thumbnail) {
          if (err) {
            throw err;
          }

          fs.writeFile(__dirname + '/assets/gogopher_thumbnail.jpg', thumbnail, function(err) {
            done();
          });
        });

    });
  });

  describe('Fop.imageView().straem()', function() {
    it('should return a thumbnail asset by a stream', function(done) {
      
      // imageView Stream
      var imageStream = asset.fop()
        .imageView({
          mode    : 2,
          width   : 180,
          height  : 180,
          quality : 85,
          format  : 'jpg'
        })
        .stream();
      var writingStream = fs.createWriteStream(__dirname + '/assets/gogopher_thumbnail.jpg');

      imageStream.pipe(writingStream)
        .on('error', function(err) {
          throw err;
        })
        .on('finish', function() {
          done();
        });
    });
  });

  describe('Fop.imageMogr()', function() {
    it('should return a processed asset', function(done) {
      
      // imageMogr
      asset.fop()
        .imageMogr({
          thumbnail : '300x500',
          gravity   : 'NorthWest',
          crop      : '!300x400a10a10',
          quality   : 85,
          rotate    : 90,
          format    : 'jpg'
        })
        .exec(function(err, mogred) {
          if (err) {
            throw err;
          }

          fs.writeFile(__dirname + '/assets/gogopher_mogred.jpg', mogred, function(err) {
            done();
          });
        });

    });
  });

  describe('Fop.imageMogr().stream()', function() {
    it('should return a processed asset by a stream', function(done) {

      // imageMogr
      var imageStream = asset.fop()
        .imageMogr({
          thumbnail : '300x500',
          gravity   : 'NorthWest',
          crop      : '!300x400a10a10',
          quality   : 85,
          rotate    : 90,
          format    : 'jpg'
        })
        .stream();
      var writingStream = fs.createWriteStream(__dirname + '/assets/gogopher_mogred.jpg');

      imageStream.pipe(writingStream)
        .on('error', function(err) {
          throw err;
        })
        .on('finish', function() {
          done();
        });

    });
  });

  describe('Fop.watermark()', function() {
    it('should return a asset with a watermark', function(done) {
      
      // watermarks
      asset.fop()
        .watermark({
          mode: 1,
          image: 'http://www.b1.qiniudn.com/images/logo-2.png',
          dissolve: 70,
          gravity: 'SouthEast',
          dx: 20,
          dy: 20
        })
        .exec(function(err, pic) {
          if (err) {
            throw err;
          }

          fs.writeFile(__dirname + '/assets/gogopher_watermark.jpg', pic, function(err) {
            done();
          });
        });

    });
  });

  describe('Fop.watermark().stream()', function() {
    it('should return a asset with a watermark by stream', function(done) {
      
      // watermarks
      var imageStream = asset.fop()
        .watermark({
          mode: 1,
          image: 'http://www.b1.qiniudn.com/images/logo-2.png',
          dissolve: 70,
          gravity: 'SouthEast',
          dx: 20,
          dy: 20
        })
        .stream();
      var writingStream = fs.createWriteStream(__dirname + '/assets/gogopher_watermark.jpg');

      imageStream.pipe(writingStream)
        .on('error', function(err) {
          throw err;
        })
        .on('finish', function() {
          done();
        });

    });
  });

  describe('Fop.qrcode()', function() {
    it('should return the qrcode image of the asset', function(done) {
      
      // watermarks
      asset.fop()
        .qrcode()
        .exec(function(err, pic) {
          if (err) {
            throw err;
          }

          fs.writeFile(__dirname + '/assets/gogopher_qrcode.png', pic, function(err) {
            done();
          });
        });

    });
  });

  describe('Fop.qrcode().stream()', function() {
    it('should return the qrcode image of the asset by stream', function(done) {
      
      // watermarks
      var imageStream = asset.fop()
        .qrcode()
        .stream();
      var writingStream = fs.createWriteStream(__dirname + '/assets/gogopher_qrcode.png');

      imageStream.pipe(writingStream)
        .on('error', function(err) {
          throw err;
        })
        .on('finish', function() {
          done();
        });

    });
  });

  describe('Fop.md2html()', function() {
    it('should convert Mardkdown to HTML', function(done) {
      
      // watermarks
      qiniu.testBucket.key('sample.md').fop()
        .md2html()
        .exec(function(err, html) {
          if (err) {
            throw err;
          }

          fs.writeFile(__dirname + '/assets/sample.html', html, function(err) {
            done();
          });
        });

    });
  });

});