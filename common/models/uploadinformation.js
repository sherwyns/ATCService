'use strict';
//let log = require('./../../server/logger');


module.exports = function(Uploadinformation) {

  Uploadinformation.products = async (req, res, cb) => {
    let db =  Uploadinformation.dataSource;
    let products = req.body.data;
    let storeid  = req.body.storeid;
    let filename  = req.body.filename;
  
    try {
          let uploadRes = await Uploadinformation.prototype.addUploadinformation("progress", filename, storeid, 0, Uploadinformation);
          let values = await Uploadinformation.prototype.getProducts(uploadRes, products, storeid, filename, Uploadinformation);
          Uploadinformation.app.models.product.create(values, async function(err, res){
            console.log(err);
            if(err){
              log.error(err);
              throw 'Error in bulk upload';
             } else {
               await Uploadinformation.prototype.updateUploadinformation(uploadRes, "Success", filename, storeid, 1, Uploadinformation);
             }
           }); 
     } catch (err) {
 //     log.error(err);
      console.log(err);
    }
  };
  Uploadinformation.prototype.getProducts = async (uploadRes, productList, storeid, filename, Uploadinformation) => {
      try{
        let i = 1;
        let products = [];
        for (let product of productList){
           let data = {};
           if (product.title === '' || product.availability === '' || product.category === '') {
              let message = "Data is missing in row:" + i
              //await addUploadinformation(message, filename, storeid, 0, Uploadinformation);
              await Uploadinformation.prototype.updateUploadinformation(uploadRes, message, filename, storeid, 0, Uploadinformation);
              throw message;
              break;
            } else {
              function isUrlValid(userInput) {
                var regexQuery = "^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?&/=%]*)?$";
                var url = new RegExp(regexQuery,"i");
                return url.test(userInput);
              }
              if(!Uploadinformation.prototype.isUrlValid(product.image_url)){
                let message = "Image url is inavlid at row:" + i
                //await addUploadinformation(message, filename, storeid, 0, Uploadinformation);
                await Uploadinformation.prototype.updateUploadinformation(uploadRes, message, filename, storeid, 0, Uploadinformation);
                throw message;
                break;
              } else {  
                data.store_id = storeid;         
                data.title = product.title;
                data.description = product.description;
                data.image = product.image_url;
                data.category = product.category;
                let price = product.price === '' ? 0 : product.price;
                data.price = parseFloat(price);
                products.push(data);
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
