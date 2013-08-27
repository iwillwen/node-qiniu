var qiniu = require('./');
var fs    = require('fs');

qiniu.testBucket.putFile('gogopher.jpg', __dirname + '/assets/gogopher.jpg', function(err) {
  if (err) {
    return console.error(err);
  }

  console.log('Done!');
});