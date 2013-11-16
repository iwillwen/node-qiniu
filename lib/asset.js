var request    = require('request');
var Q          = require('q');
var util       = require('util');
var url        = require('url');
var dataStream = require('dataStream');
var _          = require('underscore');
var utils      = require('./utils');
var config     = require('./config');
var Fop        = require('./fop');
var token      = require('./token')(config);

var AccessToken = token.AccessToken;

/**
 * Asset Class
 * @param {String} key    Asset's key
 * @param {Bucket} parent Bucket object
 */
function Asset(key, parent, config) {
  this.key = key;
  this.parent = parent;
  this.access_token = new AccessToken();

  this.config = config || {};
}

/**
 * return the asset url
 * @return {String} url
 */
Asset.prototype.url = function() {
  return url.format({
    protocol: 'http',
    hostname: util.format('%s.u.qiniudn.com', this.parent.name),
    pathname: '/' + this.key
  });
};

/**
 * return the encoded entry url of the asset
 * @return {String} entry url
 */
Asset.prototype.entryUrl = function() {
  return utils.safeEncode(util.format(
    '%s:%s',
    this.parent.name, this.key
  ));
};

/**
 * return the qrcode image of the asset
 * @param  {Object}   opts     options
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
Asset.prototype.qrcode = function(opts, callback) {
  var deferred = Q.defer();
  switch (true) {
    case _.isFunction(opts):
      callback = opts;
      opts = { mode: 0, level: 'L' };
      break;
    case _.isObject(opts) && _.isUndefined(callback):
      callback = noop;
      break;
    case _.isUndefined(opts):
      opts = { mode: 0, level: 'L' };
      callback = noop;
      break;
  }

  var _url = util.format('%s?qrcode/%d/level/%s', this.url(), opts.mode, opts.level);

  var recive = new dataStream();
  request(_url).pipe(recive)
    .on('error', function(err) {
      callback(err);
      deferred.reject(err);
    })
    .on('complete', function() {
      var data = this.body();

      callback(null, data);
      deferred.resolve(data);
    });

  var promise = deferred.promise;

  promise.stream = function() {
    return recive;
  };

  return promise;
};

/**
 * get the asset's stat
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
Asset.prototype.stat = function(callback) {
  var deferred = Q.defer();
  callback = callback || noop;

  var path = util.format('/stat/%s', this.entryUrl());
  var _url = url.format({
    protocol: 'http',
    hostname: config.rsUrl,
    pathname: path
  });

  var token = this.access_token.token(path, null);

  request({
    url: _url,
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, function(err, res, body) {
    if (err) {
      deferred.reject(err);
      return callback(err);
    }

    var result = JSON.parse(body);

    deferred.resolve(result);
    callback(null, result);
  });

  return deferred.promise;
};

/**
 * move the asset to another position
 * @param  {Asset}   destAsset  dest Asset
 * @param  {Function} callback  Callback
 * @return {Promise}            promise object
 */
Asset.prototype.move = function(destAsset, callback) {
  var deferred = Q.defer();
  callback = callback || noop;

  var path = util.format('/move/%s/%s', this.entryUrl(), destAsset.entryUrl());
  var _url = url.format({
    protocol: 'http',
    hostname: config.rsUrl,
    pathname: path
  });

  var token = this.access_token.token(path, null);

  request({
    url: _url,
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, function(err, res) {
    if (err) {
      deferred.reject(err);
      return callback(err);
    }


    deferred.resolve();
    callback(null);
  });

  return deferred.promise;
};

/**
 * make a copy of the asset to another position
 * @param  {Asset}   destAsset  dest Asset
 * @param  {Function} callback  Callback
 * @return {Promise}            promise object
 */
Asset.prototype.copy = function(destAsset, callback) {
  var deferred = Q.defer();
  callback = callback || noop;

  var path = util.format('/copy/%s/%s', this.entryUrl(), destAsset.entryUrl());
  var _url = url.format({
    protocol: 'http',
    hostname: config.rsUrl,
    pathname: path
  });

  var token = this.access_token.token(path, null);

  request({
    url: _url,
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, function(err, res, body) {
    if (err) {
      deferred.reject(err);
      return callback(err);
    }

    deferred.resolve();
    callback(null);
  });

  return deferred.promise;
};

/**
 * delete the asset
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
Asset.prototype.remove = function(callback) {
  var deferred = Q.defer();
  callback = callback || noop;

  var path = util.format('/delete/%s', this.entryUrl());
  var _url = url.format({
    protocol: 'http',
    hostname: config.rsUrl,
    pathname: path
  });

  var token = this.access_token.token(path, null);

  request({
    url: _url,
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, function(err, res, body) {
    if (err) {
      deferred.reject(err);
      return callback(err);
    }

    deferred.resolve();
    callback(null);
  });

  return deferred.promise;
};

Asset.prototype.fop = function(config) {
  return new Fop(this, config);
};

/**
 * return a image with a established format
 * @param  {String}   alias    alias name
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
Asset.prototype.alias = function(alias, callback) {
  var deferred = Q.defer();
  callback = callback || noop;

  var _url = this.url();

  _url += util.format('%s%s', this.config.separate, alias);
  
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
 * Markdown to HTML
 * @param  {Object}   opts     options
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
Asset.prototype.md2html = function(opts, callback) {
  var deferred = Q.defer();

  if (_.isFunction(opts)) {
    callback = opts;
    opts = {
      mode: false,
      css: false
    };
  } else if (_.isObject(opts)) {
    callback = callback || noop;
  } else {
    callback = callback || noop;
    opts = {
      mode: false,
      css: false
    };
  }

  var _url = this.url() + '?md2html';

  if (opts.mode) {
    _url += util.format('/%s', opts.mode);
  }

  if (opts.css) {
    _url += util.format('/css/%s', utils.safeEncode(opts.css));
  }

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

  return deferred.promise;
};

module.exports = Asset;

function noop() {
  return false;
}