'use strict';
let log = require('./../../server/logger');
let request = require("request-promise");
let config = require('./../../env.config');
module.exports = function(Shopify) {

  Shopify.validateuser = async (req, res, cb) => {
    try{
        Shopify.app.models.Email.send({
            to: 'ravikumarmmt@gmail.com',
            from: 'atc@gmail.com',
            subject: 'my subject',
            text: 'my text',
            html: 'my <em>html</em>'
          }, function(err, mail) {
            if(err) 
                return err;
            console.log('email sent!', mail);
            
          });        
        let configData = {
            "client_id": config.apiKey,
            "client_secret": config.apiSecretKey,
            "code": req.body.code
        }
        // let accessToken = await Shopify.prototype.getStoreAccessToken(req.body.shop, configData);
        // let shopUser = await Shopify.prototype.getShopUserDetails(req.body.shop, accessToken);
        // let useremail = shopUser.shop.email;
        // let userExist =  await Shopify.prototype.isUserExists(useremail);  
        // if(!userExist){
        //     let userid = await Shopify.prototype.createUser(useremail); 
          //  let storeId = await Shopify.prototype.createStore(userid, shopUser.shop); 
 


        //     return false;
        // } else {
           
        //     return true;
        // } 
        

    } catch (err) {
        let error = new Error(err);
        error.status = 400;
        log.error(error);
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
            let productOtions = {
                url: `https://${shopDomain}${config.shopifyShopUrl}`,
                method: 'GET',
                json: true,
                headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' }            
            }

            let response = await request(productOtions);     
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
                    resolve(true);                    
                }
            });
      });       
  }

  Shopify.prototype.createUser = (useremail) => {
    return new Promise( async (resolve, reject) => {
            Shopify.app.models.User.create({
                'username': '',
                'email': useremail,
                'password': 'atc@123',
                'emailVerified': false,
              }, (err, userRes) => {
                 if(err)
                    return reject(err);
                 resolve(userRes.id);     
            });
      });      
  }
  
  Shopify.prototype.createStore = (userid, shop) => {
    return new Promise( async (resolve, reject) => {
        let path = null;
        let data = {
            'shop_name': shop.name,
            'user_id': userid,
            'name': req.body.name,
            'store_url': shop.domain,
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
            Store.create(data, function(err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res.id)
            });    

    });       
  }
 
  Shopify.remoteMethod('validateuser', {
    description: 'API to edit store details.',
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
};
