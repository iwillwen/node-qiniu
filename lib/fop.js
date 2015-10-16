var request    = require('request');
var _          = require('underscore');
var fs         = require('fs');
var path       = require('path');
var Promise    = require('bluebird');
var util       = require('util');
var url        = require('url');
var Asset      = require('./asset');
var utils      = require('./utils');
var config     = require('./config');
var Token      = require('./token')(config);

/**
 * Fop Class
 * @param {Asset} asset    asset
 * @param {Object} _config config
 */
function Fop(asset, _config) {
  this.parent = asset;
  this.config = _.extend(_.clone(config), _config);

  this.query = '';
}

/**
 * custom fop
 * @param  {String} str fop string
 * @return {Fop}     fop
 */
Fop.prototype.fop = function(str) {
  this.query += '|' + str;

  return this;
};

/**
 * Add imageInfo to the fop
 * @return {Fop} fop
 */
Fop.prototype.imageInfo = function() {
  this.query += '|imageInfo';

  return this;
};

/**
 * Add exif to the fop
 * @return {Fop} fop
 */
Fop.prototype.exif = function() {
  this.query += '|exif';

  return this;
};


var imageViewTranslations = {
  weight: 'w',
  height: 'h',
  quality: 'q'
};

/**
 * Add imageView to the fop
 * @param  {Object} opts options
 * @return {Fop}      fop
 */
Fop.prototype.imageView = function(opts) {
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

  this.query += util.format('|imageView/%d%s', mode, genOptUrl(params));

  return this;
};

/**
 * Add imageMogr to the fop
 * @param  {Object} opts options
 * @return {Fop}      fop
 */
Fop.prototype.imageMogr = function(opts) {
  var params = {};

  _.extend(params, opts);

  this.query += util.format('|imageMogr/v2/auto-orient%s', genOptUrl(params));

  return this;
};

/**
 * Add watermark to the fop
 * @param  {Object} opts options
 * @return {Fop}      fop
 */
Fop.prototype.watermark = function(opts) {
  var params = {};
  var mode = opts.mode;
  delete opts.mode;

  _.extend(params, opts);

  params.image = utils.safeEncode(params.image);

  this.query += util.format('|watermark/%d%s', mode, genOptUrl(params));

  return this;
};

/**
 * Add qrcode to the fop
 * @param  {Object} opts options
 * @return {Fop}      fop
 */
Fop.prototype.qrcode = function(opts) {
  opts = opts || {
    mode: 0,
    level: 'L'
  };

  this.query += util.format('|qrcode/%d/level/%s', this.url(), opts.mode, opts.level);

  return this;
};

/**
 * Markdown to HTML
 * @param  {Object}   opts     options
 * @return {Fop}           fop
 */
Fop.prototype.md2html = function(opts) {
  opts = opts || {
    mode: false,
    css: false
  };

  var _url = '|md2html'

  if (opts.css) {
    _url += util.format('/%s', opts.mode);
  }

  if (opts.css) {
    _url += util.format('/css/%s', utils.safeEncode(opts.css));
  }

  this.query += _url;

  return this;
};

/**
 * Save the fop result as an asset
 * @param  {Asset} destAsset dest
 * @return {Fop}           fop
 */
Fop.prototype.saveas = function(destAsset) {
  var entryUrl = destAsset.entryUrl();

  this.query += util.format('|saveas/%s', entryUrl);

  var token = (new Token.SaveasToken(this.url())).token();

  this.query += util.format('/sign/%s', token);

  return this;
};

/**
 * Create a download url for this asset
 * @param  {String} filename filename
 * @return {Fop}          fop
 */
Fop.prototype.download = function(filename) {
  this.query += util.format('|download/%s', filename);

  return this;
};

/**
 * Get the url of the fop
 * @return {String} url
 */
Fop.prototype.url = function() {
  return util.format('%s?%s', this.parent.url(), this.query.substr(1));
};

/**
 * Return the fop string
 * @return {String} fop
 */
Fop.prototype.get = function() {
  return this.query.substr(1);
};

/**
 * Generate a get token for this fop
 * @return {Object} token
 */
Fop.prototype.token = function() {
  var getPolicy = new Token.GetPolicy();
  return getPolicy.token(this.url(), this.parent.key, {
    fop: this.get()
  });
};

/**
 * Execute the fop
 * @param  {Function} callback Callback
 * @return {Promise}            promise object
 */
Fop.prototype.exec = function(callback) {
  var self = this
  return new Promise(function(resolve, reject) {
    callback = callback || noop;

    request(self.url(), function(err, resp, body) {
      if (err) {
        reject(err);
        return callback(err);
      }

      resolve(body);
      callback(null, body);
    });
  })
};

/**
 * Return a stream of the fop
 * @return {Stream} stream
 */
Fop.prototype.stream = function() {
  return request(this.url());
};

module.exports = Fop;

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