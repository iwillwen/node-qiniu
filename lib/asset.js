var request    = require('request');
var Promise    = require('bluebird');
var util       = require('util');
var url        = require('url');
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
    hostname: util.format('%s.qiniudn.com', this.parent.name),
    pathname: '/' + this.key
  });
};

/**
 * generate a download token
 * @return {String} token
 */
Asset.prototype.token = function(opts) {
  var getPolicy = new token.GetPolicy(opts);
  return getPolicy.token(util.format('http://%s.qiniudn.com', this.parent.name), this.key, opts);
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
  var self = this
  var recive = null
  var promise = new Promise(function(resolve, reject) {
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

    var _url = util.format('%s?qrcode/%d/level/%s', self.url(), opts.mode, opts.level);

    recive = request(_url, function(err, resp, body) {
      if (err) {
        reject(err);
        return callback(err);
      }

      resolve(body);
      callback(null, body);
    });
  })

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
  var self = this
  return new Promise(function(resolve, reject) {
    callback = callback || noop;

    var path = util.format('/stat/%s', self.entryUrl());
    var _url = url.format({
      protocol: 'http',
      hostname: config.rsUrl,
      pathname: path
    });

    var token = self.access_token.token(path, null);

    request({
      url: _url,
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }, function(err, res, body) {
      if (err) {
        reject(err);
        return callback(err);
      }

      var result = JSON.parse(body);

      resolve(result);
      callback(null, result);
    });
  })
};

/**
 * move the asset to another position
 * @param  {Asset}   destAsset  dest Asset
 * @param  {Function} callback  Callback
 * @return {Promise}            promise object
 */
Asset.prototype.move = function(destAsset, callback) {
  var self = this
  return new Promise(function(resolve, reject) {
    callback = callback || noop;

    var path = util.format('/move/%s/%s', self.entryUrl(), destAsset.entryUrl());
    var _url = url.format({
      protocol: 'http',
      hostname: config.rsUrl,
      pathname: path
    });

    var token = self.access_token.token(path, null);

    request({
      url: _url,
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }, function(err, res) {
      if (err) {
        reject(err);
        return callback(err);
      }


      resolve();
      callback(null);
    });
  })
};

/**
 * make a copy of the asset to another position
 * @param  {Asset}   destAsset  dest Asset
 * @param  {Function} callback  Callback
 * @return {Promise}            promise object
 */
Asset.prototype.copy = function(destAsset, callback) {
  var self = this
  return new Promise(function(resolve, reject) {
    callback = callback || noop;

    var path = util.format('/copy/%s/%s', self.entryUrl(), destAsset.entryUrl());
    var _url = url.format({
      protocol: 'http',
      hostname: config.rsUrl,
      pathname: path
    });

    var token = self.access_token.token(path, null);

    request({
      url: _url,
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }, function(err, res, body) {
      if (err) {
        reject(err);
        return callback(err);
      }

      resolve();
      callback(null);
    });
  })
};

/**
 * delete the asset
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
Asset.prototype.remove = function(callback) {
  var self = this
  return new Promise(function(resolve, reject) {
    callback = callback || noop;

    var path = util.format('/delete/%s', self.entryUrl());
    var _url = url.format({
      protocol: 'http',
      hostname: config.rsUrl,
      pathname: path
    });

    var token = self.access_token.token(path, null);

    request({
      url: _url, 
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }, function(err, res, body) {
      if (err) {
        reject(err);
        return callback(err);
      }

      resolve();
      callback(null);
    });
  })
};

Asset.prototype.fetch = function(url, callback) {
  var self = this
  return new Promise(function(resolve, reject) {
    callback = callback || noop;

    var path = util.format('/fetch/%s/to/%s', utils.safeEncode(url), self.entryUrl());
    var _url = url.format({
      protocol: 'http',
      hostname: config.vipUrl,
      pathname: path
    });

    var token = self.access_token.token(path, null);

    request({
      url: _url, 
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }, function(err, res, body) {
      if (err) {
        reject(err);
        return callback(err);
      }

      resolve();
      callback(null);
    });
  })
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
  var self = this
  var recive = null
  var promise = new Promise(function(resolve, reject) {
    callback = callback || noop;

    var _url = self.url();

    _url += util.format('%s%s', self.config.separate, alias);
    
    recive = request(_url, function(err, resp, body) {
      if (err) {
        reject(err);
        return callback(err);
      }

      resolve(body);
      callback(null, body);
    });
  })

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
 * Generate a download link for this asset
 * @param  {String} filename filename
 * @return {String}          download link
 */
Asset.prototype.download = function(filename) {
  var urlInfo = url.parse(this.url());
  urlInfo.search = '?download/' + filename;

  return url.format(urlInfo);
};

/**
 * Markdown to HTML
 * @param  {Object}   opts     options
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
Asset.prototype.md2html = function(opts, callback) {
  var self = this
  var recive = null
  var promise = new Promise(function(resolve, reject) {
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

    var _url = self.url() + '?md2html';

    if (opts.mode) {
      _url += util.format('/%s', opts.mode);
    }

    if (opts.css) {
      _url += util.format('/css/%s', utils.safeEncode(opts.css));
    }

    recive = request(_url, function(err, resp, body) {
      if (err) {
        reject(err);
        return callback(err);
      }

      resolve(body);
      callback(null, body);
    });
  })

  promise.stream = function() {
    return recive
  }

  return promise
};

module.exports = Asset;

function noop() {
  return false;
}