'use strict';

const csv = require('csvtojson');
const request = require('request');
//let log = require('./../../server/logger');

/**
 * @class ProductBulkuploadWorker
 */
class ProductBulkuploadWorker {
  
 /**
  * 
  * @param {*} data 
  */
  async processMessage(data) {
    try {
        let dataJson = JSON.parse(data);
        console.log(dataJson);
        let jsonObj =  await csv().fromFile(dataJson.productsCsv);
        console.log("jsonObj", jsonObj);
        request.post({url: 'http://localhost:3000/api/uploadinformations/products', form: {data: jsonObj, storeid: dataJson.storeid, filename: dataJson.filename}}, function(err, httpResponse, body) {
          if(err)
  //            log.error(err);
          console.log("Body", body);
        });
    } catch (error) {
//      log.error(error);
      console.log(error);
    }
  }
}
module.exports = ProductBulkuploadWorker;
// new ProductBulkuploadWorker();
