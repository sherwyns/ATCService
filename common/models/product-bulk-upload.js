'use strict';

let multer = require('multer');
let fs = require('fs');
let path = require('path');
let log = require('./../../server/logger');
let publish = require('../../server/worker/queuePublisher');
let Channel = require('../../server/worker/queueClient');
const request = require('request');
let uploadedFileName = '';
let fileDirectory = '/var/www/html/ATCService/server/local-storage/';
let storeid = '';
// let url = 'http://34.209.125.112/';
let url = 'http://localhost:3000/';
const csv = require('csvtojson');

module.exports = function(Productbulkupload) {
  let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './server/local-storage/');
    },
    filename: (req, file, cb) => {
      uploadedFileName = file.fieldname + '_' + Date.now();
      cb(null, file.fieldname + '_' + Date.now() + '.csv');
    },
  });
  let msg = '';
  Productbulkupload.uploads = function(req, res, cb) {
    let upload = multer({
      storage: storage,
      fileFilter: function(req, file, cb) {
        let ext = path.extname(file.originalname);
        if (ext !== '.csv') {
          msg = file.originalname + ' is not csv file. pls Upload csv file';
          req.fileValidationError = msg;
          return cb(null, false, new Error(msg));
        }
        cb(null, true);
      },
    }).array('csvfile', 12);
    upload(req, res,  function(err) {
      if (req.fileValidationError) {
        log.error(req.fileValidationError);
        return res.json(msg);
      }
      if (err) {
        return res.json(err);
      }
      let productsCsv = fileDirectory + uploadedFileName + '.csv';
      csv()
      .fromFile(productsCsv)
      .then((jsonObj)=>{
        console.log(jsonObj);

        request.post({url: url + 'api/uploadinformations/products', form: {data: jsonObj, storeid: req.body.store_id, filename: uploadedFileName + '.csv'}}, function(err, httpResponse, body) {
          if (err) {
            console.log(err);
            log.error(err);
            cb(err, null);
          } else {
            console.log(body);
            cb(null, true);
          }
        });
      });
      // let jsonObj =  await csv().fromFile(productsCsv);
      // console.log(jsonObj);
      // request.post({url: url+'api/uploadinformations/products', form: {data: jsonObj, storeid: req.body.store_id, filename: uploadedFileName + '.csv'}}, function(err, httpResponse, body) {
      //     if(err){
      //       console.log(err);
      //       log.error(err);
      //       cb(err, null);
      //     } else {
      //     cb(null, true);
      //     }
      // });
    });
  };

  Productbulkupload.remoteMethod('uploads',   {
    description: 'Uploads a file',
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

