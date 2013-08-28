var _ = require('underscore');

var qiniu = exports;

qiniu.version = '6.1.0';

var _configData = require('./config');

qiniu.Bucket = require('./bucket')(_configData);
qiniu.Token  = require('./token')(_configData);
qiniu.Asset  = require('./asset');
qiniu.Image  = require('./image');
qiniu.Batch  = require('./batch');

/**
 * Global Config
 * @param  {String/Object} key   key of config
 * @param  {Mix}           value value
 *
 *   qiniu.config({
 *     access_key: '-----',
 *     secret_key: '-----',
 *    
 *     // global token option
 *     callbackUrl: 'http://images.example.com/upload/callback',
 *     callbackBody: '{                   \
 *       "foo"   : "bar",                 \
 *       "name"  : $(fname),              \
 *       "size"  : $(fsize),              \
 *       "type"  : $(mimeType),           \
 *       "hash"  : $(etag),               \
 *       "w"     : $(imageInfo.width),    \
 *       "h"     : $(imageInfo.height),   \
 *       "color" : $(exif.ColorSpace.val) \
 *     }'
 *   });
 *
 *   qiniu.config('foo', 'bar');
 *   qiniu.config('foo');
 * 
 */
qiniu.config = function(key, value) {
  if (arguments.length > 1 && _.isString(key)) {
    // set config data normally
    qiniu.set(key, value);
  } else {
    switch (true) {
      case _.isString(key):
        // Get config data
        return qiniu.get(key);
        break;
      case _.isObject(key):
        // Set config data with a object
        _.each(key, function(_value, _key) {
          qiniu.set(_key, _value);
        });
        break;
    }
  }

  return this;
};

/**
 * Set config data
 * @param  {String} key   key
 * @param  {Mix}    value value
 * @return {Object}       qiniu object
 */
qiniu.set = function(key, value) {
  _configData[key] = value;

  return this;
};

/**
 * Get config data
 * @param  {String} key   key
 * @return {Mix}          config value
 */
qiniu.get = function(key) {
  return _configData[key];
};

qiniu.bucket = function(bucket) {
  return new Bucket(bucket);
};

qiniu.batch = function(config) {
  return new qiniu.Batch(config);
};