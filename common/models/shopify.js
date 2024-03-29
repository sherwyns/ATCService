'use strict';
let log = require('./../../server/logger');
let request = require("request-promise");
let config = require('./../../env.config');
const stripHtmltags = /(<([^>]+)>)/ig;
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
        await Shopify.prototype.appUninstall(req.body.shop, accessToken);        
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
        // console.log(err);
        log.error(err);
        let error = new Error(err);
        error.status = 400;
        return error;
    }
    };
    Shopify.prototype.deleteWebhooks = (shop, accessToken) => {
        return new Promise( async (resolve, reject) => {
            try {
                let webhooks = await Shopify.prototype.getAllWebhooks(shop, accessToken);
                webhooks = webhooks.webhooks
                if(webhooks.length == 0){
                    resolve(true);
                } else {
                    for (let item of webhooks) {
                        await Shopify.prototype.deleteWebhookFromShopify(shop, accessToken, item.id);
                    }
                    resolve(true);
                }
                
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
                    'address': `${config.shopifydomain}api/shopify/productscreate`,
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
                    'address': `${config.shopifydomain}api/shopify/productsupdate`,
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
                    'address': `${config.shopifydomain}api/shopify/productsdelete`,
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
                reject(err);
            }
        });
    }

    Shopify.prototype.appUninstall =  (shop, accessToken) => {
        return new Promise( async (resolve, reject) => {
            try {
                let atcdata = {
                    'webhook': {
                    'topic': 'shop/update',
                    'address': `${config.domain}api/shopify/shopifyAppUninstall`,
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
                console.log("shop/update");
                resolve(true);
            } catch (err) {
              reject(err);
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
                //df
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
                // await Shopify.prototype.updateShopifyAccesstoken(isShopExists, shop, accessToken);
                resolve(isShopExists);
            }
        } catch (err) {
            reject(err);
        }  

    });       
  }

    Shopify.prototype.isShopExists = (shopifyshopid) => {
        return new Promise( async (resolve, reject) => {
            Shopify.app.models.Store.findOne({'where': {'shopifyshopid': shopifyshopid}}, (err, res) => {
                if(err)
                    reject (err);
                if (!res) { 
                    resolve(false);
                } else {
                    console.log(res)
                    resolve(res.id);                    
                }
            });
        });       
    }

    Shopify.prototype.updateStore = (storeid, shop, accessToken) => {
        return new Promise( async (resolve, reject) => {
            // let data = {
            //     tax_id: accessToken,
            //     shopifyshopid: shop.id
            // }
            let data = {
                deactivate_account: 1,
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
        if(!shop){
            return {status:0} 
        } else {
            let res = await Shopify.prototype.createProducts(req.body.storeid, shop);
            if(res){
                return {status:200}
            }
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

  Shopify.prototype.saveProducts = (products, productcategoryid) =>{
    return new Promise((resolve, reject) => {
        try{
            Shopify.app.models.product.create(products, (err, res) => {
                if(err){
                    reject(err);  
                } else{
                    if(productcategoryid){
                        if (!res || !(Array.isArray(res)) || res.length === 0){
                            reject(new Error('No results when creating product'));
                        }
                        let db =  Shopify.dataSource;
                        let sql = `INSERT INTO productcategory  VALUES (NULL, '${productcategoryid}', '${res[0].id}');`;
                        db.connector.execute(sql, (err2, res2) => {
                        if (err2) {
                            reject(err2); 
                        }else
                            resolve(true)
                        });    
                    } else {
                        resolve(true)
                    }
                }   
            });
        }catch(err){
            reject(err)
        }
    });
  };
  Shopify.prototype.createProducts = (storeid, shop) => {
    return new Promise( async (resolve, reject) => {
        try{
            let shopifycategory = null;
            let productcategoryid = null;
            let shopifyProducts = JSON.parse(await Shopify.prototype.getShopifyProducts(shop));
            let shopProducts = shopifyProducts.products;
            let i=0;
            for (let item of shopProducts){
                let isProductExists = await Shopify.prototype.isProductExists(item.id);
                let imgSrc  = !item.image ? item.image : item.image.src;
                let categoryName = (!item.product_type) ? null : item.product_type;
                let categoryId = !categoryName ? null : JSON.parse(JSON.stringify(await Shopify.prototype.productCategory(categoryName)));
                if(!categoryId || (Array.isArray(categoryId) && categoryId.length == 0)){
                    shopifycategory = categoryName;
                }
                else{
                    shopifycategory = null;
                    productcategoryid = categoryId[0].id;
                }
                if(!isProductExists){
                    let  products = [];
                    let data = {};
                    data.title = item.title;
                    data.store_id = storeid;
                    data.shopifyproductid = item.id,
                    data.price =  !'variants' in item ? null : item.variants[0].price;
                    data.description = !"body_html" in item ? null: item.body_html.replace(stripHtmltags, ""),
                    data.category = null,
                    data.shopifycategory = shopifycategory, 
                    data.image = imgSrc,
                    products.push(data);
                    await Shopify.prototype.saveProducts(products, productcategoryid);
                }
                i++;
                if(i < shopProducts.length - 1){
                    resolve(true);
                }
            }
        } catch(err){
            reject(err);  
        }
    })    
    }
    Shopify.prototype.isProductExists = (shopifyproductid) => {
        return new Promise( async (resolve, reject) => {
            let db =  Shopify.dataSource;
            let sql = `SELECT * FROM product where shopifyproductid = ?`;
            let params = [shopifyproductid]
            db.connector.execute(sql, params, function(err, res) {
              if (err) {
                reject(err);
              }
              if(res && Array.isArray(res) && res.length == 1){
                resolve(true);   
              } else {
                resolve(false);    
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

  Shopify.prototype.getShop = (storeid) => {
    return new Promise( async (resolve, reject) => {
        let db =  Shopify.dataSource;
        let sql = `SELECT * FROM Store WHERE id = ? AND deactivate_account = 1 AND tax_id IS NOT NULL`;
        let params = [storeid]
        db.connector.execute(sql, params, function(err, res) {
          if (err) {
            reject(err);
          }
          if(res.length == 1){
            resolve(true);   
          } else {
            resolve(false);    
          }
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

    
    Shopify.productscreate =  async (req, res, cb) => {
        try{
            let request = req.body;
            let ShopifyShopUrl = req.headers['x-shopify-shop-domain'];
            let storeid = await Shopify.prototype.getStoreid(ShopifyShopUrl);
            if(storeid){
                await Shopify.prototype.createProduct(storeid, request);
                return true
            }
        } catch (err) {
           log.error(err);
        }
    }

    Shopify.prototype.getStoreid = (ShopifyShopUrl) => {
        return new Promise( async (resolve, reject) => {
            Shopify.app.models.Store.find({'where': {'store_url': ShopifyShopUrl}}, (err, res) => {
                if(err)
                    reject (err);
                if (!res) { 
                    resolve(false);
                } else {
                    resolve(res[0].id);                    
                }
            });
        });       
    }

    Shopify.prototype.createProduct = (storeid, product) => {
        return new Promise( async (resolve, reject) => {
            try{
                
                let  products = [];
                let shopifycategory = null;
                let productcategoryid = null;
                let item = product;
                let isProductExists = await Shopify.prototype.isProductExists(item.id);
                let imgSrc  = !item.image ? item.image : item.image.src;
                // let category = await Shopify.prototype.productCategory(item.product_type);
                let categoryName = (!item.product_type) ? null : item.product_type
                let categoryId = !categoryName ? null : JSON.parse(JSON.stringify(await Shopify.prototype.productCategory(categoryName)));
                if(!categoryId || (Array.isArray(categoryId) && categoryId.length == 0)){
                    shopifycategory = categoryName;
                }
                else{
                    shopifycategory = null;
                    productcategoryid = categoryId[0].id;
                }
                if(!isProductExists){
                    let data = {};
                    data.title = item.title;
                    data.store_id = storeid;
                    data.shopifyproductid = item.id,
                    data.price =  item.variants[0].price;
                    data.description = !"body_html" in item ? null: item.body_html.replace(stripHtmltags, ""),
                    data.category = null,
                    data.shopifycategory = shopifycategory,
                    data.image = imgSrc,
                    products.push(data);
                }
                if(products.length === 0){
                    resolve(true);  
                } else {
                    Shopify.app.models.product.create(products, function(err, res) {
                        if(err){
                            reject(err);  
                        }    
                        if(productcategoryid){
                            if (!res || !(Array.isArray(res)) || res.length === 0){
                                reject(new Error('No results when creating product'));
                            }
                            let db =  Shopify.dataSource;
                            let sql = `INSERT INTO productcategory  VALUES (NULL, '${productcategoryid}', '${res[0].id}');`;
                            db.connector.execute(sql, (err2, res2) => {
                                if (err2) {
                                reject(err2); 
                                }
                                resolve(true);
                            });
                        }
                        else{
                            resolve(true);
                        }    
                    });
                }
            } catch(err){
                reject(err);  
            }
        })    
    }

    Shopify.prototype.productCategory = (categoryName) => {
        return new Promise( async (resolve, reject) => {
        try{
            let db = Shopify.dataSource;
            let sql = `SELECT id FROM productcategories WHERE name = ?`;
            let params = [categoryName];
            db.connector.execute(sql, params, (err, product) => {
            if (err) {
                reject(err);
            }
                resolve(product);
            }); 
        } catch(err){
            reject(err); 
        }
        }) 
    }


    Shopify.remoteMethod('productscreate', {
        accepts: [
            {arg: 'req', type: 'object', http: {source: 'req'}},
            {arg: 'res', type: 'object', http: {source: 'res'}},
        ],
        http: {
            path: '/productscreate',
            verb: 'post',
        },
        returns: {
            arg: 'data',
            type: 'object',

        },
    });
    

    Shopify.productsupdate =  async (req, res, cb) => {
        try{
            let request = req.body;
            let ShopifyShopUrl = req.headers['x-shopify-shop-domain'];
            let storeid = await Shopify.prototype.getStoreid(ShopifyShopUrl);
            if(storeid){
                await Shopify.prototype.updateProduct(storeid, request);
            }
        } catch (err) {
            log.error(err);
        }
    }

    Shopify.prototype.updateProduct = (storeid, product) => {
        return new Promise( async (resolve, reject) => {
            try{
                let item = product;
                let results = await Shopify.prototype.getProduct(item.id);
                let imgSrc  = !item.image ? item.image : item.image.src;
                let shopifycategory = results[0].shopifycategory ? item.product_type : null;
                if(results){
                    let data = {};
                    data.title = item.title;
                    data.store_id = storeid;
                    data.shopifyproductid = item.id,
                    data.price =  item.variants[0].price;
                    data.description = !"body_html" in item ? null: item.body_html.replace(stripHtmltags, ""),
                    data.category = null,
                    data.shopifycategory = shopifycategory,
                    data.image = imgSrc,

                    Shopify.app.models.product.update({shopifyproductid: item.id}, data, function(err, res) {
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
    Shopify.prototype.getProduct = (id) => {
        return new Promise( async (resolve, reject) => {
            Shopify.app.models.product.find({'where': {'shopifyproductid': id}}, (err, res) => {
                if(err)
                    return reject (err);
                if (!res) { 
                    resolve(false);
                } else {
                    resolve(res);                    
                }
            });
        });  
    }

    Shopify.remoteMethod('productsupdate', {
        accepts: [
            {arg: 'req', type: 'object', http: {source: 'req'}},
            {arg: 'res', type: 'object', http: {source: 'res'}},
        ],
        http: {
            path: '/productsupdate',
            verb: 'post',
        },
        returns: {
            arg: 'data',
            type: 'object',
        },
        
    });


  Shopify.productsdelete =  async (req, res, cb) => {
    try{
        let request = req.body;
        let ShopifyShopUrl = req.headers['x-shopify-shop-domain'];
        let storeid = await Shopify.prototype.getStoreid(ShopifyShopUrl);
        if(storeid){
            await Shopify.prototype.deleteProduct(storeid, request);
            return true
        }
    } catch (err) {
        log.error(err);
    }    
  }

    Shopify.prototype.deleteProduct = (storeid, request) => {
        return new Promise( async (resolve, reject) => {
            Shopify.app.models.product.destroyAll({shopifyproductid: request.id}, (err, res) => {
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

  Shopify.remoteMethod('productsdelete', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/productsdelete',
      verb: 'post',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
    
  });


  Shopify.shopifyAppUninstall =  async (req, res, cb) => {
    try{
        let request = req.body;
        let ShopifyShopUrl = req.headers['x-shopify-shop-domain'];
        await Shopify.prototype.deActivateStore(ShopifyShopUrl);
    } catch (err) {
        log.error(err);
    }    
  }
  Shopify.prototype.deActivateStore = (ShopifyShopUrl) => {
    return new Promise( async (resolve, reject) => {
        Shopify.app.models.Store.updateAll({'store_url': ShopifyShopUrl}, {"deactivate_account": 0}, (err, res) => {
            if(err)
                reject (err);
            if (!res) { 
                resolve(false);
            } else {
                resolve(true);                    
            }
        });
    });       
}

  Shopify.remoteMethod('shopifyAppUninstall', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/shopifyAppUninstall',
      verb: 'post',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
    
  });

  
};
