'use strict';
let log = require('./../../server/logger');
let request = require("request-promise");
let config = require('./../../env.config');
module.exports = function(Shopify) {

    Shopify.validateuser = async (req, res, cb) => {
    try{
        let configData = {
            "client_id": config.apiKey,
            "client_secret": config.apiSecretKey,
            "code": req.body.code
        }
        let accessToken = await Shopify.prototype.getStoreAccessToken(req.body.shop, configData);
        await Shopify.prototype.deleteWebhooks(req.body.shop, accessToken);
        await Shopify.prototype.productCreate(req.body.shop, accessToken); 
        await Shopify.prototype.productUpdate(req.body.shop, accessToken); 
        await Shopify.prototype.productDelete(req.body.shop, accessToken);        
        let shopUser = await Shopify.prototype.getShopUserDetails(req.body.shop, accessToken);
        let useremail = shopUser.shop.email;
        let userExist =  await Shopify.prototype.isUserExists(useremail);
        if(!userExist){
            await Shopify.prototype.createStore(null, req.body.shop, accessToken, shopUser.shop); 
            let data = {
                status : 0,
                email: useremail,
                accessToken: accessToken
            }
            return data; // No User
        } else {
            let storeid = await Shopify.prototype.createStore(userExist, req.body.shop, accessToken, shopUser.shop);
            await Shopify.prototype.shopifyProducts(storeid, req.body.shop, accessToken); 
            let data = {
                status : 1,
            }            
            return data; // existing user
        } 
    } catch (err) {
        console.log(err);
        // log.error(err);
        // let error = new Error(err);
        // error.status = 400;
        // return error;
    }
    };
    Shopify.prototype.deleteWebhooks = (shop, accessToken) => {
        return new Promise( async (resolve, reject) => {
            try {
                let webhooks = await Shopify.prototype.getAllWebhooks(shop, accessToken);

                webhooks = webhooks.webhooks
                for (let item of webhooks) {
                    await Shopify.prototype.deleteWebhookFromShopify(shop, accessToken, item.id);
                }
                resolve(true);
            } catch (err) {
               reject(err);
            }
        });
    }
    Shopify.prototype.deleteWebhookFromShopify = (shop, accessToken, id) => {
        return new Promise( async (resolve, reject) => {
            try {
                    let url = `https://${shop}${config.shopifydeleteWebHookUrl}${id}.json`
                    let shopOtions = {
                    url: url,
                    method: 'DELETE',
                    json: true,
                    headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json'}           
                }
                let response = await request(shopOtions);     
                resolve(response);
            } catch (err) {
               reject(err);
            }
        });        
    }

    Shopify.prototype.getAllWebhooks = (shop, accessToken) => {
        return new Promise( async (resolve, reject) => {
            try {
                    let shopOtions = {
                    url: `https://${shop}${config.shopifyWebHookUrl}`,
                    method: 'GET',
                    json: true,
                    headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json'}           
                }
                let response = await request(shopOtions);     
                resolve(response);
            } catch (err) {
               reject(err);
            }
        });
    }


    Shopify.prototype.productCreate =  (shop, accessToken) => {
        return new Promise( async (resolve, reject) => {
            try {
                let atcdata = {
                    'webhook': {
                    'topic': 'products/create',
                    'address': config.shopifydomain,
                    'format': 'json',
                    },
                };
                    let shopOtions = {
                    url: `https://${shop}${config.shopifyWebHookUrl}`,
                    method: 'POST',
                    json: true,
                    body: atcdata,
                    headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json', 'Accept': 'application/json'}           
                }
                let response = await request(shopOtions);     
                console.log("products/create");
                resolve(true);
            } catch (err) {
             //  reject(err);
            }
        });
    } 
    Shopify.prototype.productUpdate =  (shop, accessToken) => {
        return new Promise( async (resolve, reject) => {
            try {
                let atcdata = {
                    'webhook': {
                    'topic': 'products/update',
                    'address': config.shopifydomain,
                    'format': 'json',
                    },
                };
                    let shopOtions = {
                    url: `https://${shop}${config.shopifyWebHookUrl}`,
                    method: 'POST',
                    json: true,
                    body: atcdata,
                    headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json', 'Accept': 'application/json'}           
                }
                let response = await request(shopOtions);     
                console.log("products/update");
                resolve(true);
            } catch (err) {
               // reject(err);
            }
        });
    } 
    Shopify.prototype.productDelete =  (shop, accessToken) => {
        return new Promise( async (resolve, reject) => {
            try {
                let atcdata = {
                    'webhook': {
                    'topic': 'products/delete',
                    'address': config.shopifydomain,
                    'format': 'json',
                    },
                };
                    let shopOtions = {
                    url: `https://${shop}${config.shopifyWebHookUrl}`,
                    method: 'POST',
                    json: true,
                    body: atcdata,
                    headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json', 'Accept': 'application/json'}           
                }
                let response = await request(shopOtions);     
                console.log("products/delete");
                resolve(true);
            } catch (err) {
              //  reject(err);
            }
        });
    }  

  Shopify.prototype.getStoreAccessToken = (shopDomain, configData) => {

    return new Promise( async (resolve, reject) => {
        try {
            let rqOption = {
                url: `https://${shopDomain}${config.shopifyAccessTokenUrl}`,
                method: 'POST',
                json: true,
                body: configData,
                headers: { 'Content-Type': 'application/json' }
            }

            let response = await request(rqOption);     
            resolve(response.access_token);

        }catch(err){
            reject (err);
        }
      });       
  }

  Shopify.prototype.getShopUserDetails = (shopDomain, accessToken) => {

    return new Promise( async (resolve, reject) => {
        try {
            let shopOtions = {
                url: `https://${shopDomain}${config.shopifyShopUrl}`,
                method: 'GET',
                json: true,
                headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' }            
            }

            let response = await request(shopOtions);     
            resolve(response);

        }catch(err){
            reject (err);
        }
      });       
  }
  Shopify.prototype.isUserExists = (userEmail) => {

    return new Promise( async (resolve, reject) => {
            Shopify.app.models.User.findOne({'where': {'email': userEmail}}, (err, user) => {
                if(err)
                    return reject (err);
                if (!user) { 
                    resolve(false);
                } else {
                    resolve(user.id);                    
                }
            });
      });       
  }

  Shopify.prototype.createUser = (useremail) => {
    return new Promise( async (resolve, reject) => {
            let password = 'atc@123';
            Shopify.app.models.User.create({
                'username': '',
                'email': useremail,
                'password': password,
                'emailVerified': false,
              }, (err, userRes) => {
                 if(err){
                    return reject(err);
                 } else {
                    let html = "";
                        html += `<p><strong>Email: </strong>${useremail}</p>
                                 <p><strong>Password: </strong>${password}</p>`
                    Shopify.app.models.Email.send({
                        to: useremail,
                        from: 'atc@gmail.com',
                        subject: 'ATC Credentials',
                        text: '',
                        html: html
                    }, function(err, mail) {
                        if(err) 
                            return reject(err);
                        resolve(userRes.id);    
                    });                     
                 }   
                      
            });
      });      
  }


  Shopify.prototype.createStore = (userid, shopdomain, accessToken, shop) => {
    return new Promise( async (resolve, reject) => {
        try{
            let isShopExists = await Shopify.prototype.isShopExists(shop.id);
            if(!isShopExists) {
                let path = null;
                let userId = !userid ? 0 : userid;
                let data = {
                    'shop_name': shop.name,
                    'user_id': userId,
                    'name': shop.name,
                    'store_url': shop.domain,
                    "tax_id": accessToken,
                    "shopifyshopid": shop.id,
                    'business_type': null,
                    'timezone': 'pacific state zone',
                    'workinghours': null,
                    'image': path,
                    'tagline': null,
                    'description': null,
                    "neighbourhood":null,
                    'latitude': shop.latitude,
                    'longitude': shop.longitude,
                };
                Shopify.app.models.Store.create(data, function(err, res) {
                    if (err) {
                        return reject(err);
                    }
                    let db =  Shopify.dataSource;

                    let tokensql = `INSERT INTO shopifyaccesstoken (id, store_id, shop_domain, access_token) VALUES (NULL, '${res.id}', '${shopdomain}', '${accessToken}');`;
                    db.connector.execute(tokensql, function(err, res1) {
                        if (err) 
                            return reject(err);
                    });  

                    let sql = `INSERT INTO address (id, user_id, store_id, contact_name, adddressone, addresstwo, suite, city, state, zipcode, phonenumber, created_at, modified_at) VALUES 
                    (NULL, '${0}', '${res.id}', '${shop.name}', '${shop.address1}', '${shop.address2}', NULL, '${shop.city}', '${shop.province}', '${shop.zip}', '${shop.phone}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
                    db.connector.execute(sql, function(err, res2) {
                        if (err) {
                            return reject(err);
                        } else { 
                            resolve(res.id)
                        }
                    });  
                });
            } else {
                await Shopify.prototype.updateStore(isShopExists, shop, accessToken);
                await Shopify.prototype.updateShopifyAccesstoken(isShopExists, shop, accessToken);
            }
        } catch (err) {
            reject(err);
        }  

    });       
  }

    Shopify.prototype.isShopExists = (shopifyshopid) => {
        return new Promise( async (resolve, reject) => {
            Shopify.app.models.Store.find({'where': {'shopifyshopid': shopifyshopid}}, (err, res) => {
                if(err)
                    reject (err);
                if (!res) { 
                    resolve(false);
                } else {
                    resolve(res.id);                    
                }
            });
        });       
    }

    Shopify.prototype.updateStore = (storeid, shop, accessToken) => {
        return new Promise( async (resolve, reject) => {
            let data = {
                tax_id: accessToken,
                shopifyshopid: shop.id
            }
            Shopify.app.models.Store.updateAll({id: storeid}, data, function(err, res){
                if(err){
                    log.error(err);
                    let error = new Error(err);
                    error.status = 400;
                    reject(error);               
                }
                   resolve(true);            
            }); 
        });       
    }
    Shopify.prototype.updateShopifyAccesstoken = (storeid, shop, accessToken) => {
        return new Promise( async (resolve, reject) => {
            let data = {
                store_id: storeid,
                access_token: accessToken
            }
            Shopify.app.models.shopifyaccesstoken.updateAll({shop_domain: shop.domain}, data, function(err, res){
                if(err){
                    log.error(err);
                    let error = new Error(err);
                    error.status = 400;
                    reject(error);               
                }
                resolve(true);           
            }); 
        });       
    }    

 
  Shopify.remoteMethod('validateuser', {
    description: 'Shopify.',
    accepts: [
              {arg: 'req', type: 'object', http: {source: 'req'}},
              {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/validateuser',
      verb: 'post',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });

  Shopify.products = async (req, res, cb) => {
    try{
       
        let shop = await  Shopify.prototype.getAccessToken(req.body.storeid);
        let res = await Shopify.prototype.createProducts(req.body.storeid, shop);
        if(res){
            return {status:200}
        }
    } catch (err) {
        log.error(err);
        let error = new Error(err);
        error.status = 400;
        return error;
    }
  }     

  Shopify.prototype.shopifyProducts = async (storeid, shopdomain, accessToken) => {
      try {
        let shop = {
            shop_domain: shopdomain,
            access_token: accessToken
        }
        let res = await Shopify.prototype.createProducts(storeid, shop);
        if(res){
            return res;
        }        
    } catch(err){
        throw err;
    }
  }

  Shopify.prototype.createProducts = (storeid, shop) => {
    return new Promise( async (resolve, reject) => {
        try{
            let  products = [];
            let shopifyProducts = JSON.parse(await Shopify.prototype.getShopifyProducts(shop));
            let shopProducts = shopifyProducts.products;
            for (let item of shopProducts){
                let isProductExists = await Shopify.prototype.isProductExists(item.id);
                if(!isProductExists){
                    let data = {};
                    data.title = item.title;
                    data.store_id = storeid;
                    data.shopifyproductid = item.id,
                    data.price =  item.variants[0].price;
                    data.description = null,
                    data.category = null,
                    data.shopifycategory = item.product_type,
                    data.image = item.image.src;
                    products.push(data);
                }
            };
            if(products.length === 0){
                resolve(true);  
            } else {    
                console.log("products", products);
                Shopify.app.models.product.create(products, function(err, res) {
                    if(err){
                        let error = new Error(err);
                        error.status = 400;
                        reject(error);  
                    }    
                    resolve(true);
                });
            }
        } catch(err){
            reject(err);  
        }
    })    
    
    }
    Shopify.prototype.isProductExists = (shopifyproductid) => {

        return new Promise( async (resolve, reject) => {
                Shopify.app.models.product.findOne({'where': {'shopifyproductid': shopifyproductid}}, (err, res) => {
                    if(err)
                        return reject (err);
                    if (!res) { 
                        resolve(false);
                    } else {
                        resolve(true);                    
                    }
                });
          });       
    }

  Shopify.prototype.getShopifyProducts = (shop) => {
    return new Promise( async (resolve, reject) => {
        try {
            let productOtions = {
                url: `https://${shop.shop_domain}${config.shopifyReadProductUrl}`,
                method: 'GET',
                headers: { 'X-Shopify-Access-Token': shop.access_token, 'Content-Type': 'application/json' }            
            }

            let response = await request(productOtions);     
            resolve(response);

        }catch(err){
            reject (err);
        }
      });  
  }


  Shopify.prototype.getAccessToken = (storeid) => {
    return new Promise( async (resolve, reject) => {
        Shopify.app.models.shopifyaccesstoken.findOne({'where': {'store_id': storeid}}, (err, data) => {
            if(err)
                return reject (err);
            resolve(data);                    
        });
    }); 
  }

  Shopify.remoteMethod('products', {
    description: 'Shopify.',
    accepts: [
              {arg: 'req', type: 'object', http: {source: 'req'}},
              {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/products',
      verb: 'post',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });

  Shopify.saveUserId = async (req, res, cb) => {
    try{

        Shopify.app.models.Store.updateAll({tax_id: req.body.accesstoken}, {user_id: req.body.userid}, function(err, res){
            if(err){
                log.error(err);
                let error = new Error(err);
                error.status = 400;
                return error;               
            }
               return true;            
          }); 

    } catch (err) {

    }
  }    

  Shopify.remoteMethod('saveUserId', {
    description: 'Shopify.',
    accepts: [
              {arg: 'req', type: 'object', http: {source: 'req'}},
              {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/saveUserId',
      verb: 'post',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });  
  
};
