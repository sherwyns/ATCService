'use strict';

const csv = require('csvtojson');
const request = require('request');


/**
 * @class ProductBulkuploadWorker
 */
class ProductBulkuploadWorker {
    /**
     *
     */
  constructor() {

  }

    /**
     * @param {*} data
     * @memberof TallyInvoiceWorker
     */
  async processMessage(data) {
    try {
        let dataJson = JSON.parse(data);
        let jsonObj =  await csv().fromFile(dataJson.productsCsv);
        console.log(dataJson.filename);
        request.post({url: 'http://localhost:3000/api/uploadinformations/products', form: {data: jsonObj, storeid: dataJson.storeid, filename: dataJson.filename}}, function(err, httpResponse, body) {
          console.log("zXZXZ", body);
        });
            
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = ProductBulkuploadWorker;
// new ProductBulkuploadWorker();
