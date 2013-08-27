var qiniu = require('../');

qiniu.config({
  access_key: '------',
  secret_key: '------'
});

qiniu.testBucket = new qiniu.Bucket('qiniu-sdk-test');

module.exports = qiniu;
