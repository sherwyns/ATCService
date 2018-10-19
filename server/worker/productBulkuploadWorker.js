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
        request.post({url: 'http://localhost:3000/api/uploadinformations/products', form: {data: jsonObj, storeid: dataJson.storeid}}, function(err, httpResponse, body) {
          res.json(body);
        });
            
    } catch (error) {

    }
  }
}
module.exports = ProductBulkuploadWorker;
// new ProductBulkuploadWorker();
