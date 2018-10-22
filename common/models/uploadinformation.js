'use strict';

module.exports = function(Uploadinformation) {

  Uploadinformation.products = async (req, res, cb) => {
    let db =  Uploadinformation.dataSource;
    let products = req.body.data;
    let storeid  = req.body.storeid;
    let filename  = req.body.filename;
    try {
          let uploadRes = await addUploadinformation("progress", filename, storeid, 0, Uploadinformation);
          let values = await getProducts(uploadRes, products, storeid, filename, Uploadinformation);
          Uploadinformation.app.models.product.create(values, async function(err, res){
            console.log(err);
            if(err){
              throw ('Error in bulk upload');
             } else {
               await updateUploadinformation(uploadRes, "Success", filename, storeid, 1, Uploadinformation);
             }
           }); 
     } catch (err) {
      console.log(err);
    }
  };
  Uploadinformation.remoteMethod('products',   {
    description: 'A object contains list of product details.',
    accepts: [
                {arg: 'req', type: 'object', http: {source: 'req'}},
                {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    returns: {
      arg: 'fileObject', type: 'object', root: true,
    },
    http: {verb: 'post'},
  });
};


  function getProducts(uploadRes, products, storeid, filename, Uploadinformation){
  return new Promise(async (resolve,reject) => {
    try{
      let productData = [];
      let i = 1;
      for (let product of products){
         let data = {};
         if (product.sku === '' || product.title === '' || product.availability === '' || product.category === '') {
            let message = "Data is missing in row:" + i
            //await addUploadinformation(message, filename, storeid, 0, Uploadinformation);
            await updateUploadinformation(uploadRes, message, filename, storeid, 0, Uploadinformation);
            reject (message);
            break;
          } else {
            if(!isUrlValid(product.imageurl)){
              let message = "Image url is inavlid at row:" + i
              //await addUploadinformation(message, filename, storeid, 0, Uploadinformation);
              await updateUploadinformation(uploadRes, message, filename, storeid, 0, Uploadinformation);
              reject (message);
              break;
            } else {  
              data.store_id = storeid;         
              data.sku = product.sku;
              data.title = product.title;
              data.description = product.description;
              data.image = product.imageurl;
              let price = product.price === '' ? 0 : product.price;
              data.price = parseFloat(price);
              productData.push(data);
            }
        }
          i++;
      };
      if(i-1 === products.length) {
        resolve(productData);
      }
     
    }catch(err){
        reject (err);
    }
}); 
}


function isUrlValid(userInput) {
  var regexQuery = "^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?&/=%]*)?$";
  var url = new RegExp(regexQuery,"i");
  return url.test(userInput);
}

function addUploadinformation(message, filename, storeid, status, Uploadinformation){
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


function updateUploadinformation(uploadRes, message, filename, storeid, status, Uploadinformation){
  return new Promise((resolve,reject) => {
    try{
      let data = {};
      data.store_id = storeid;
      data.name = filename;
      data.type = "product";
      data.message = message;
      data.status = status;
      Uploadinformation.replaceById(uploadRes.id, data, function(err, res){
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