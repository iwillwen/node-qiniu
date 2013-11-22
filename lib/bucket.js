var request    = require('request');
var _          = require('underscore');
var fs         = require('fs');
var path       = require('path');
var Q          = require('q');
var dataStream = require('dataStream');
var util       = require('util');
var url        = require('url');
var path       = require('path');
var Asset      = require('./asset');
var Image      = require('./image');
var token      = null;

var globalConfig = null;


/**
 * Bucket
 * Example:
 * ```
 * var imagesBucket = new qiniu.Bucket('images', {
 *   // special option
 * });
 * ```
 * @param {String} bucketName bucket's name
 * @param {Object} config     config
 */
function Bucket(bucketName, config) {
  config = config || {};

  this.name = bucketName;
  this.config = _.extend(globalConfig, config, {
    scope: bucketName
  });
}

/**
 * Upload a file
 * Example:
 * ```
 * imagesBucket.putFile('example.jpg', __dirname + '/assert/example.jpg', function(err, reply) {
 *   if (err) {
 *     return console.error(err);
 *   }
 *  
 *   console.dir(reply);
 * });
 * ```
 * @param  {String}   key      key
 * @param  {String}   pathname file pathname
 * @param  {Object}   options  upload option
 * @param  {Function} callback Callback
 * @return {Promise}           Promise object
 */
Bucket.prototype.putFile = function(key, pathname, options, callback) {
  // token
  var deferred = Q.defer();

  switch (arguments.length) {
    case 3:
      if (_.isFunction(options)) {
        callback = options;
        options = {};
      }
      break;
    case 2:
      options = {};
      callback = noop;
      break;
  }

  var config = _.extend(_.clone(this.config), options);

  var putToken = (new token.PutPolicy(config)).token();

  // safe pathname
  pathname = path.resolve(process.cwd(), pathname);

  // upload API
  var uploadUrl = url.format({
    protocol: 'http',
    hostname: globalConfig.uploadUrl
  });

  // uploading
  var req = request.post(uploadUrl, function(err, res, body) {
    var result = JSON.parse(body);

    if (err) {
      deferred.reject(err);
      return callback(err, result);
    }

    deferred.resolve(result);
    callback(null, result);
  });

  // form data
  var form = req.form();

  form.append('token', putToken);
  form.append('key', key);
  form.append('file', fs.createReadStream(pathname), {
    filename: path.basename(pathname)
  });

  return deferred.promise;
};

/**
 * create a uploading stream
 * @param  {String} key      key
 * @param  {Object} options  upload option
 * @return {Stream}          uploading stream
 */
Bucket.prototype.createPutStream = function(key, options) {

  options = options || {};

  var config = _.extend(_.clone(this.config), options);

  // token
  var putToken = (new token.PutPolicy(config)).token();

  var stream = new dataStream();

  // upload API
  var uploadUrl = url.format({
    protocol: 'http',
    hostname: globalConfig.uploadUrl
  });

  // uploading
  var req = request.post(uploadUrl, function(err, res, body) {
    var result = JSON.parse(body);

    if (err) {
      return stream.emit('error', err);
    }

    stream.emit('end', result);
    stream.emit('complete', result);
  });

  // form data
  var form = req.form();

  form.append('token', putToken);
  form.append('key', key);
  stream.on('pipe', function(src) {
    if (src.path) {
      var filename = path.basename(src.path);
    } else {
      var filename = key;
    }
    form.append('file', stream, {
      filename: filename
    });
  });

  return stream;
};

/**
 * Get a key
 * @param  {String}   key      key
 * @param  {Function} callback Callback
 * @return {Promise}           Promise Object
 */
Bucket.prototype.getFile = function(key, callback) {
  // token
  var getToken = (new token.GetPolicy(this.config)).token(this.name, key);
  var deferred = Q.defer();
  callback = callback || noop;

  // key url
  var _url = url.format({
    protocol: 'http',
    hostname: util.format('%s.qiniudn.com', this.name),
    pathname: '/' + key,
    query: {
      e: 3600,
      token: getToken
    }
  });

  var res = request(_url);
  var recive = new dataStream();
  res.pipe(recive)
    .on('error', deferred.reject.bind(deferred))
    .on('complete', function() {
      var data = this.body();

      deferred.resolve(data);
      callback(null, data);
    });

  return deferred.promise;
};

/**
 * create a getting stream
 * @param  {String} key key
 * @return {Stream}     getting stream
 */
Bucket.prototype.createGetStream = function(key) {
  // token
  var getToken = (new token.GetPolicy(this.config)).token(this.name, key);

  // key url
  var _url = url.format({
    protocol: 'http',
    hostname: util.format('%s.qiniudn.com', this.name),
    pathname: '/' + key,
    query: {
      e: 3600,
      token: getToken
    }
  });

  var res = request(_url);

  return res;
};

/**
 * return a asset object
 * @param  {String} key key
 * @return {Asset}      asset object
 */
Bucket.prototype.key = function(key) {
  return new Asset(key, this);
};
Bucket.Asset = Asset;

Bucket.prototype.image = function(key) {
  return new Image(key, this);
};
Bucket.Image = Image;

Bucket.prototype.token = function(opts) {
  opts = opts || {};

  opts = _.extend(opts, {
    scope: this.name
  });

  var putToken = (new token.PutPolicy(opts)).token();

  return putToken;
};

module.exports = function(config) {
  globalConfig = config;
  token = require('./token')(globalConfig);
  return Bucket;
};

function noop() {
  return false;
}