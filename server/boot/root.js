'use strict';

var url = require('url');
let log = require('./../logger');
let config = require('./../../env.config');

module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', server.loopback.status());

  // install Shopify
  router.get('/install', (req, res) => {
    try {
      let urlParts = url.parse(req.url, true);
      let query = urlParts.query;
      let shop = query.shop;
      let redirectUrl = `https://${shop}/admin/oauth/authorize?client_id=${config.clientApiKey}&scope=${config.scopes}&redirect_uri=${config.redirectUri}`;
      res.redirect(redirectUrl);
    } catch (err) {
      log.error(err);
    }
  });

  router.post('/products/create', (req, res) => {
    try {
      console.log('reqfromwebhook=>', req.body);
    } catch (err) {
      log.error(err);
    }
  });

  router.post('/products/update', (req, res) => {
    try {
      console.log('reqfromwebhook=>', req.body);
    } catch (err) {
      log.error(err);
    }
  });

  router.post('/products/delete', (req, res) => {
    try {
      console.log('reqfromwebhook=>', req.body);
    } catch (err) {
      log.error(err);
    }
  });

  // End Of Shopify

  server.use(router);
};
