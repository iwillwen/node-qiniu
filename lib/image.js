var request    = require('request');
var _          = require('underscore');
var fs         = require('fs');
var path       = require('path');
var Q          = require('q');
var dataStream = require('dataStream');
var util       = require('util');
var url        = require('url');
var Asset      = require('./asset');
var utils      = require('./utils');

/**
 * Image Asset
 * @param {String} key    key
 * @param {Bucket} parent bucket object
 */
function Image(key, parent, _config) {
  var config = _.extend(_.clone(parent.config), {
    separate: '-'
  }, _config);

  this.key = key;
  this.parent = parent;
  this.config = config;
}
util.inherits(Image, Asset);

/**
 * get the image's infomations
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
Image.prototype.imageInfo = function(callback) {
  var deferred = Q.defer();
  callback = callback || noop;

  var infoUrl = this.url() + '?imageInfo';

  request(infoUrl, function(err, res, body) {
    if (err) {
      deferred.reject(err);
      return callback(err);
    }

    var info = JSON.parse(body);

    deferred.resolve(info);
    callback(null, info);
  });

  return deferred.promise;
};

/**
 * get the exif infomation of the picture
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
Image.prototype.exif = function(callback) {
  var deferred = Q.defer();
  callback = callback || noop;

  var infoUrl = this.url() + '?exif';

  request(infoUrl, function(err, res, body) {
    if (err) {
      deferred.reject(err);
      return callback(err);
    }

    var info = JSON.parse(body);

    deferred.resolve(info);
    callback(null, info);
  });

  return deferred.promise;
};

var imageViewTranslations = {
  weight: 'w',
  height: 'h',
  quality: 'q'
};

/**
 * return a thumbnail image
 * @param  {Object}   opts     options
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
Image.prototype.imageView = function(opts, callback) {
  var deferred = Q.defer();
  callback = callback || noop;

  var mode = opts.mode;
  delete opts.mode;

  var _url = this.url();
  var params = {};

  _.each(opts, function(value, key) {
    if (imageViewTranslations.hasOwnProperty(key)) {
      key = imageViewTranslations[key];
    }

    params[key] = value;
  });

  _url += util.format('?imageView/%d%s', mode, genOptUrl(params));

  var recive = new dataStream();
  request(_url).pipe(recive)
    .on('complete', function() {
      var data = this.body();

      deferred.resolve(data);
      callback(null, data);
    })
    .on('error', function(err) {
      deferred.reject(err);
      callback(err);
    });


  var promise = deferred.promise;

  /**
   * return the image stream
   * @return {Stream} stream
   */
  promise.stream = function() {
    return recive;
  };

  return promise;
};

/**
 * return a processed image
 * @param  {Object}   opts     options
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
Image.prototype.imageMogr = function(opts, callback) {
  var deferred = Q.defer();
  callback = callback || noop;

  var _url = this.url();
  var params = {};

  _.extend(params, opts);
  
  _url += util.format('?imageMogr/v2/auto-orient%s', genOptUrl(params));

  var recive = new dataStream();
  request(_url).pipe(recive)
    .on('complete', function() {
      var data = this.body();

      deferred.resolve(data);
      callback(null, data);
    })
    .on('error', function(err) {
      deferred.reject(err);
      callback(err);
    });

  var promise = deferred.promise;

  /**
   * return the image stream
   * @return {Stream} stream
   */
  promise.stream = function() {
    return recive;
  };

  return promise;
};

/**
 * return a image with a watermark
 * @param  {Object}   opts     options
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
Image.prototype.watermark = function(opts, callback) {
  var deferred = Q.defer();
  callback = callback || noop;

  var _url = this.url();
  var params = {};
  var mode = opts.mode;
  delete opts.mode;

  _.extend(params, opts);

  params.image = utils.safeEncode(params.image);

  _url += util.format('?watermark/%d%s', mode, genOptUrl(params));

  var recive = new dataStream();
  request(_url).pipe(recive)
    .on('complete', function() {
      var data = this.body();

      deferred.resolve(data);
      callback(null, data);
    })
    .on('error', function(err) {
      deferred.reject(err);
      callback(err);
    });

  var promise = deferred.promise;

  /**
   * return the image stream
   * @return {Stream} stream
   */
  promise.stream = function() {
    return recive;
  };

  return promise;
};

module.exports = Image;

function genOptUrl(params) {
  var _url = "";

  _.each(params, function(value, key) {
    _url += util.format('/%s/%s', key, value);
  });

  return _url;
}

function noop() {
  return false;
}