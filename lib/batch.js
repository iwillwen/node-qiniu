var request    = require('request');
var Q          = require('q');
var _          = require('underscore');
var util       = require('util');
var url        = require('url');
var http       = require('http');
var utils      = require('./utils');
var config     = require('./config');

/**
 * multiple assets control
 * @param {Object} _config config
 */
function Batch(_config) {
  this.config = _.extend(_.clone(config), _config);

  var token       = require('./token')(this.config);
  var AccessToken = token.AccessToken;

  this.access_token = new AccessToken();
  this.op = '';
}

/**
 * Queue a stat control
 * @param  {Asset} asset asset
 * @return {Batch}       Batch 
 */
Batch.prototype.stat = function(asset) {
  this.op += '&' + genOpUrl('stat', asset);

  return this;
};

/**
 * Queue a move control
 * @param  {Asset} src  source asset
 * @param  {Asset} dest dest asset
 * @return {Batch}      Batch 
 */
Batch.prototype.move = function(src, dest) {
  this.op += '&' + genOpUrl('move', src, dest);
  
  return this;
};

/**
 * Queue a copy control
 * @param  {Asset} src  source asset
 * @param  {Asset} dest dest asset
 * @return {Batch}      Batch 
 */
Batch.prototype.copy = function(src, dest) {
  this.op += '&' + genOpUrl('copy', src, dest);
  
  return this;
};

/**
 * Queue a delete control
 * @param  {Asset} asset asset
 * @return {Batch}       Batch 
 */
Batch.prototype.remove = function(asset) {
  this.op += '&' + genOpUrl('delete', asset);

  return this;
};

/**
 * Execute the queue
 * @param  {Function} callback Callback
 * @return {Promise}           promise object
 */
Batch.prototype.exec = function(callback) {
  var deferred = Q.defer();
  callback = callback || noop;

  var _url = url.format({
    protocol: 'http',
    hostname: this.config.rsUrl,
    pathname: '/batch'
  });
  var body = this.op.substr(1);
  var token = this.access_token.token('/batch', body);

  request({
    url: _url,
    method: 'POST',
    body: body,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  }, function(err, res, body) {
    if (err) {
      deferred.reject(err);
      return callback(err);
    }

    if (body.length > 0) {
      var rows = JSON.parse(body);

      deferred.resolve(rows);
      callback(null, rows);
    } else {
      err = new Error(http.STATUS_CODES[503]);

      deferred.reject(err);
      callback(err);
    }
  });

  return deferred.promise;
};

module.exports = Batch;

function genOpUrl(op, src, dest) {
  var rtn = null;

  switch (op) {
    case 'stat':
      rtn = util.format('op=/stat/%s', src.entryUrl());
      break;
    case 'move':
      rtn = util.format('op=/move/%s/%s', src.entryUrl(), dest.entryUrl());
      break;
    case 'copy':
      rtn = util.format('op=/copy/%s/%s', src.entryUrl(), dest.entryUrl());
      break;
    case 'delete':
      rtn = util.format('op=/delete/%s', src.entryUrl());
      break;
  }

  return rtn;
}

function noop() {
  return false;
}