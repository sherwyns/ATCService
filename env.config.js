'use strict';

require('dotenv').config();

const env = process.env.APP_ENV;

const shopifyAccessTokenUrl = '/admin/oauth/access_token';
const shopifyShopUrl = '/admin/shop.json';
const shopifyReadProductUrl = '/admin/products.json';
const shopifyWebHookUrl = '/admin/webhooks.json';
const shopifydeleteWebHookUrl = '/admin/webhooks/';
const scopes = 'read_products,write_products';

const local = {
  domain: 'http://localhost:3000/',
  shopifydomain: 'https://dev.aroundthecorner.store/',
  clientApiKey: process.env.LOCAL_API_KEY,
  scopes: scopes,
  apiKey: process.env.LOCAL_API_KEY,
  apiSecretKey: process.env.LOCAL_API_SECRET_KEY,
  shopifyAccessTokenUrl: shopifyAccessTokenUrl,
  shopifyShopUrl: shopifyShopUrl,
  shopifyReadProductUrl: shopifyReadProductUrl,
  shopifyWebHookUrl: shopifyWebHookUrl,
  shopifydeleteWebHookUrl: shopifydeleteWebHookUrl,
  redirectUri: 'http://localhost:3001/shopify',
  fileDirectory: process.env.LOCAL_FILE_DIRECTORY,
};

const dev = {
  domain: 'https://dev.aroundthecorner.store/',
  shopifydomain: 'https://dev.aroundthecorner.store/',
  clientApiKey: process.env.DEV_API_KEY,
  scopes: scopes,
  apiKey: process.env.DEV_API_KEY,
  apiSecretKey: process.env.DEv_API_SECRET_KEY,
  shopifyAccessTokenUrl: shopifyAccessTokenUrl,
  shopifyShopUrl: shopifyShopUrl,
  shopifyReadProductUrl: shopifyReadProductUrl,
  shopifyWebHookUrl: shopifyWebHookUrl,
  shopifydeleteWebHookUrl: shopifydeleteWebHookUrl,
  redirectUri: 'http://atcdev.aroundthecorner.store/shopify',
  fileDirectory: process.env.DEV_FILE_DIRECTORY,
};

const production = {
  domain: 'https://api.aroundthecorner.store/',
  shopifydomain: 'https://api.aroundthecorner.store/',
  clientApiKey: process.env.PRODUCTION_API_KEY,
  scopes: scopes,
  apiKey: process.env.PRODUCTION_API_KEY,
  apiSecretKey: process.env.PRODUCTION_API_SECRET_KEY,
  shopifyAccessTokenUrl: shopifyAccessTokenUrl,
  shopifyShopUrl: shopifyShopUrl,
  shopifyReadProductUrl: shopifyReadProductUrl,
  shopifyWebHookUrl: shopifyWebHookUrl,
  shopifydeleteWebHookUrl: shopifydeleteWebHookUrl,
  redirectUri: 'https://app.aroundthecorner.store/shopify',
  fileDirectory: process.env.PRODUCTION_FILE_DIRECTORY,
};

const config = {
  local,
  dev,
  production,
};

module.exports = config[env];

