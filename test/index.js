var qiniu = require('../');

qiniu.config({
  access_key: 'T0lz0dQPnAeANGo3jaIAa4hx8pIS5D7uxxNx_Jr5',
  secret_key: '1GhmeedXAtJ7r9A6Cg_Vc2VpcppIczvytKgOjrrC'
});

qiniu.testBucket = new qiniu.Bucket('qiniu-sdk-test');

module.exports = qiniu;