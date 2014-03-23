/**
 * Qiniu Token generic
 */

var _     = require('underscore');
var util  = require('util');
var url   = require('url');
var qs    = require('querystring');
var utils = require('./utils');

var globalConfig = null;

/**
 * Put Policy
 * @param {Object} opts options
 */
function PutPolicy(opts) {
  var now = Math.floor(Date.now() / 1000);

  this.scope        = opts.scope        || null;
  this.deadline     = now + opts.deadline || now + 3600;
  this.endUser      = opts.endUser      || null;
  this.returnUrl    = opts.returnUrl    || null;
  this.returnBody   = opts.returnBody   || null;
  this.callbackUrl  = opts.callbackUrl  || null;
  this.callbackBody = opts.callbackBody || null;
  this.asyncOps     = opts.asyncOps     || null;
}

/**
 * Generate the token
 * @return {String} token
 */
PutPolicy.prototype.token = function() {
  var params = {};

  _.each(this, function(value, key) {
    if (!_.isNull(value)) {
      params[key] = value;
    }
  });
  return generateToken(params);
};

function generateToken(params) {
  // signature
  var signature = utils.safeEncode(JSON.stringify(params));

  // EncodedDigest
  var encodedDigest = utils.encodeSign(signature, globalConfig.secret_key);

  return util.format('%s:%s:%s', globalConfig.access_key, encodedDigest, signature)
}

function GetPolicy(opts) {
  opts = opts || {};
  var now = Math.floor(Date.now() / 1000);

  this.deadline = now + opts.deadline || now + 3600;
}

GetPolicy.prototype.token = function(domain, key, opts) {
  opts = opts || {};
  var fop = opts.fop || 'e';
  var base = '';

  if (_.isUndefined(key)) {
    // base url
    var encodedDigest = utils.encodeSign(domain, globalConfig.secret_key);
  } else {
    // safe domain
    var hostname = url.parse(domain).hostname;

    base = url.format({
      protocol: 'http',
      hostname: hostname,
      pathname: key
    });

    base += '?' + encodeURIComponent(fop);
    base += '&' + qs.stringify({
      e: this.deadline
    });

    var encodedDigest = utils.encodeSign(base, globalConfig.secret_key);
  }

  var token = util.format('%s:%s', globalConfig.access_key, encodedDigest);

  return {
    token: token,
    requestUrl: base,
    url: base + '&token=' + token
  };
};

function AccessToken() {}

AccessToken.prototype.token = function(path, body) {
  body = body || '';

  var data = util.format('%s\n%s', path, body);

  var encodeSignData = utils.encodeSign(data, globalConfig.secret_key);

  return util.format('QBox %s:%s', globalConfig.access_key, encodeSignData);
};
module.exports = function(config) {
  globalConfig = config;
  return {
    PutPolicy: PutPolicy,
    GetPolicy: GetPolicy,
    AccessToken: AccessToken
  };
};