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
        let shopUser = await Shopify.prototype.getShopUserDetails(req.body.shop, accessToken);
        let useremail = shopUser.shop.email;
        let userExist =  await Shopify.prototype.isUserExists(useremail);
        console.log("userExist", userExist);  
        if(!userExist){
            await Shopify.prototype.createStore(req.body.shop, accessToken, shopUser.shop); 
            let data = {
                status : 0,
                email: useremail,
                accessToken: accessToken
            }
            return data; // No User
        } else {
            let storeid = await Shopify.prototype.createStore(userid, req.body.shop, accessToken, shopUser.shop);
            await Shopify.prototype.shopifyProducts(storeid, req.body.shop, accessToken); 
            let data = {
                status : 1,
            }            
            return data; // existing user
        } 
    } catch (err) {
        log.error(err);
        let error = new Error(err);
        error.status = 400;
        return error;
    }
  };

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


  Shopify.prototype.createStore = (shopdomain, accessToken, shop) => {
    return new Promise( async (resolve, reject) => {
        let path = null;
        let data = {
            'shop_name': shop.name,
            'user_id': 0,
            'name': shop.name,
            'store_url': shop.domain,
            "tax_id": accessToken,
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
        let  products = [];
        let shop = await  Shopify.prototype.getAccessToken(req.body.storeid);
        // let shopifyProducts = JSON.parse(await Shopify.prototype.getShopifyProducts(shop));
        //  let shopProducts = shopifyProducts.products;
        // for (let item of shopProducts){
        //     let data = {};
        //     data.title = item.title;
        //     data.store_id = req.body.storeid;
        //     data.price =  item.variants[0].price;
        //     data.description = 
        //     data.category = null
        //     data.image = item.image.src;
        //     products.push(data);
        // };
        // Shopify.app.models.product.create(products, function(err, res) {
        //     if(err){
        //         let error = new Error(err);
        //         error.status = 400;
        //         return error;  
        //     }    
        //     return {status:200}
        // });
        let res = await Shopify.prototype.createProducts(req.body.storeid, shop);
        return res;        

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
        return res;
    } catch(err){
        throw err;
    }
  }

  Shopify.prototype.createProducts = async (storeid, shop) => {
    try {
        let shopifyProducts = JSON.parse(await Shopify.prototype.getShopifyProducts(shop));
        let shopProducts = shopifyProducts.products;
        for (let item of shopProducts){
            let data = {};
            data.title = item.title;
            data.store_id = storeid;
            data.price =  item.variants[0].price;
            data.description = 
            data.category = null
            data.image = item.image.src;
            products.push(data);
        };
        Shopify.app.models.product.create(products, function(err, res) {
            if(err){
                let error = new Error(err);
                error.status = 400;
                return error;  
            }    
            return {status:200}
        });
    } catch(err){
        throw err;
    }
    
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
