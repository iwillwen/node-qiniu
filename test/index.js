var qiniu = require('../');

qiniu.config({
  access_key: '5UyUq-l6jsWqZMU6tuQ85Msehrs3Dr58G-mCZ9rE',
  secret_key: 'YaRsPKiYm4nGUt8mdz2QxeV5Q_yaUzVxagRuWTfM'

});

qiniu.testBucket = new qiniu.Bucket('qiniu-sdk-test');

module.exports = qiniu;
