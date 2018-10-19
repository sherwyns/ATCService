'use strict';

var url = require('url');

var conf = {
  hostname: 'localhost',
  port: 3000,
  restApiRoot: '/api', // The path where to mount the REST API app
  legacyExplorer: false,
};

conf.restApiUrl = url.format({
  protocol: 'http',
  slashes: true,
  hostname: conf.hostname,
  port: conf.port,
  pathname: conf.restApiRoot,
});

module.exports = conf;
