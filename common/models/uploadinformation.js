'use strict';
let log = require('./../../server/logger');
let url = require('url');

module.exports = function(Uploadinformation) {

  Uploadinformation.products = async (req, res, cb) => {
    let db =  Uploadinformation.dataSource;
    let products = req.body.data;
    let storeid  = req.body.storeid;
    let filename  = req.body.filename;
    try {
      let uploadRes = await Uploadinformation.prototype.addUploadinformation("progress", filename, storeid, 0, Uploadinformation);
      let values = await Uploadinformation.prototype.getProducts(uploadRes, products, storeid, filename, Uploadinformation);
      let i = 1;
      for (let product of values){
        await Uploadinformation.prototype.insertProduct(product); 
        i++;
      } 
      if(i-1 === values.length) {
        await Uploadinformation.prototype.updateUploadinformation(uploadRes, "Success", filename, storeid, 1, Uploadinformation);
        return true;
      } else {
        await Uploadinformation.prototype.updateUploadinformation(uploadRes, i + "rows are saved", filename, storeid, 0, Uploadinformation);
        return false;
      }         
    } catch (err) {
       log.error(err);
    }
  };
  Uploadinformation.prototype.insertProduct = (product) => {
    return new Promise( async (resolve, reject) => {
      Uploadinformation.app.models.product.create(product, (err, res) => {
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
  Uploadinformation.prototype.getProducts = async (uploadRes, productList, storeid, filename, Uploadinformation) => {
      try{
        let i = 1;
        let products = [];
        for (let product of productList){
           let data = {};
           if (product.title === '' || product.category === '') {
              let message = "Data is missing in row:" + i
              //await addUploadinformation(message, filename, storeid, 0, Uploadinformation);
              await Uploadinformation.prototype.updateUploadinformation(uploadRes, message, filename, storeid, 0, Uploadinformation);
              throw message;
              break;
            } else {
              if(product.image_url == ''){
                data.store_id = storeid;         
                data.title = product.title;
                data.description = product.description;
                data.image = product.image_url;
                data.category = product.category;
                let price = product.price == '' ? null : product.price;
                data.price = price;
                products.push(data);
              } else {
                  if(!Uploadinformation.prototype.isUrlValid(product.image_url)){
                    let message = "Image url is inavlid at row:" + i
                    await Uploadinformation.prototype.updateUploadinformation(uploadRes, message, filename, storeid, 0, Uploadinformation);
                    throw message;
                    break;
                  } else {  
                    let urlHostname = url.parse(product.image_url).hostname;
                    let imgUrl = (urlHostname === 'www.instagram.com') ? product.image_url+'/media/?size=l' : product.image_url;
                    data.store_id = storeid;         
                    data.title = product.title;
                    data.description = product.description;
                    data.image = imgUrl;
                    data.category = product.category;
                    let price = product.price == '' ? null : product.price;
                    data.price = price;
                    products.push(data);
                }
              }
          }
          i++;
        };
        if(i-1 === productList.length) {
          return products;
        }
       
      }catch(err){
          throw err;
      }
  }

  Uploadinformation.prototype.addUploadinformation = (message, filename, storeid, status, Uploadinformation) => {
    return new Promise((resolve,reject) => {
      try{
        let data = {};
        data.store_id = storeid;
        data.name = filename;
        data.type = "product";
        data.message = message;
        data.status = status;
        Uploadinformation.create(data, function(err, res){
          if(err){
            reject (err);
          }
          resolve(res);
        }); 
  
  
      }catch(err){
          reject (err);
      }
  }); 
  }
  
  Uploadinformation.prototype.isUrlValid = (userInput) => {
    var regexQuery = "^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?&/=%]*)?$";
    var url = new RegExp(regexQuery,"i");
    return url.test(userInput);
  }

  Uploadinformation.prototype.updateUploadinformation = (uploadRes, message, filename, storeid, status, Uploadinformation) => {
    return new Promise((resolve,reject) => {
      try{
        let data = {};
        data.store_id = storeid;
        data.name = filename;
        data.type = "product";
        data.message = message;
        data.status = status;
        Uploadinformation.updateAll({id: uploadRes.id}, data, function(err, res){
          if(err){
            reject (err);
          }
          resolve(res);
        }); 
  
  
      }catch(err){
          reject (err);
      }
  }); 
  }

  Uploadinformation.remoteMethod('products',   {
    description: 'A object contains list of product details.',
    accepts: [
                {arg: 'req', type: 'object', http: {source: 'req'}},
                {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    returns: {
      arg: 'res', type: 'object', root: true,
    },
    http: {verb: 'post'},
  });
};
