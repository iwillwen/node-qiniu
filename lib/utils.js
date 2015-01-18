var crypto = require('crypto');
var fs = require('fs');

var utils = exports;

utils.safeEncode = function(str) {
  var encoded = new Buffer(str).toString('base64');
  var rtn = encoded.replace(/\//g, '_').replace(/\+/g, '-');

  return rtn;
};

utils.encodeSign = function(str, key) {
  return utils.safeEncode(
    crypto
      .createHmac('sha1', key)
      .update(str)
      .digest()
  );
};