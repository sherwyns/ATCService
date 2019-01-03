'use strict';

require('dotenv').config();

const env = process.env.APP_ENV;

const shopifyAccessTokenUrl = '/admin/oauth/access_token';
const shopifyShopUrl = '/admin/shop.json';
const shopifyReadProductUrl = '/admin/products.json';
const scopes = 'read_products,write_products';
const clientApiKey = '5db1f40a4062235576a968bf57b77f8c';

const local = {
  clientApiKey: clientApiKey,
  scopes: scopes,
  apiKey: process.env.LOCAL_API_KEY,
  apiSecretKey: process.env.LOCAL_API_SECRET_KEY,
  shopifyAccessTokenUrl: shopifyAccessTokenUrl,
  shopifyShopUrl: shopifyShopUrl,
  shopifyReadProductUrl: shopifyReadProductUrl,
  redirectUri: 'http://localhost:3001/signup',
};

const config = {
  local,
};

module.exports = config[env];

