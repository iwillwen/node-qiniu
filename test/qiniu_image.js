var qiniu      = require('./');
var fs         = require('fs');
var dataStream = require('dataStream');
var assert     = require('assert');

var image = qiniu.testBucket.image('gogopher.jpg');

describe('qiniu.Image', function() {
  
  describe('Image.imageInfo()', function() {
    it('should return some infomations of a picture', function(done) {
      
      image.imageInfo(function(err, data) {
        if (err) {
          throw err;
        }

        done();
      });

    });
  });

  describe('Image.exif()', function() {
    it('should return the exif infomation of a picture', function(done) {
      
      image.exif(function(err) {
        if (err) {
          throw err;
        }

        done();
      });

    });
  });

  describe('Image.imageView()', function() {
    it('should return a thumbnail image', function(done) {
      
      // imageView
      image.imageView({
        mode    : 2,
        width   : 180,
        height  : 180,
        quality : 85,
        format  : 'jpg'
      }, function(err, thumbnail) {
        if (err) {
          throw err;
        }

        fs.writeFile(__dirname + '/assets/gogopher_thumbnail.jpg', thumbnail, function(err) {
          done();
        });
      });

    });
  });

  describe('Image.imageView().straem()', function() {
    it('should return a thumbnail image by a stream', function(done) {
      
      // imageView Stream
      var imageStream = image.imageView({
        mode    : 2,
        width   : 180,
        height  : 180,
        quality : 85,
        format  : 'jpg'
      }).stream();
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

  describe('Image.imageMogr()', function() {
    it('should return a processed image', function(done) {
      
      // imageMogr
      image.imageMogr({
        thumbnail : '300x500',
        gravity   : 'NorthWest',
        crop      : '!300x400a10a10',
        quality   : 85,
        rotate    : 90,
        format    : 'jpg'
      }, function(err, mogred) {
        if (err) {
          throw err;
        }

        fs.writeFile(__dirname + '/assets/gogopher_mogred.jpg', mogred, function(err) {
          done();
        });
      });

    });
  });

  describe('Image.imageMogr().stream()', function() {
    it('should return a processed image by a stream', function(done) {

      // imageMogr
      var imageStream = image.imageMogr({
        thumbnail : '300x500',
        gravity   : 'NorthWest',
        crop      : '!300x400a10a10',
        quality   : 85,
        rotate    : 90,
        format    : 'jpg'
      }).stream();
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

  describe('Image.watermark()', function() {
    it('should return a image with a watermark', function(done) {
      
      // watermarks
      image.watermark({
        mode: 1,
        image: 'http://www.b1.qiniudn.com/images/logo-2.png',
        dissolve: 70,
        gravity: 'SouthEast',
        dx: 20,
        dy: 20
      }, function(err, pic) {
        if (err) {
          throw err;
        }

        fs.writeFile(__dirname + '/assets/gogopher_watermark.jpg', pic, function(err) {
          done();
        });
      });

    });
  });

  describe('Image.watermark().stream()', function() {
    it('should return a image with a watermark by stream', function(done) {
      
      // watermarks
      var imageStream = image.watermark({
        mode: 1,
        image: 'http://www.b1.qiniudn.com/images/logo-2.png',
        dissolve: 70,
        gravity: 'SouthEast',
        dx: 20,
        dy: 20
      }).stream();
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

  describe('Image.alias()', function() {
    it('should return a image with a established format', function(done) {
      
      // watermarks
      image.alias('testalias', function(err, pic) {
        if (err) {
          throw err;
        }

        fs.writeFile(__dirname + '/assets/gogopher_alias.jpg', pic, function(err) {
          done();
        });
      });

    });
  });

  describe('Image.alias().stream()', function() {
    it('should return a image with a established format by stream', function(done) {
      
      // watermarks
      var imageStream = image.alias('testalias').stream();
      var writingStream = fs.createWriteStream(__dirname + '/assets/gogopher_alias.jpg');

      imageStream.pipe(writingStream)
        .on('error', function(err) {
          throw err;
        })
        .on('finish', function() {
          done();
        });

    });
  });

});