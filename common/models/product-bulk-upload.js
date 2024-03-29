'use strict';

let multer = require('multer');
let fs = require('fs');
let path = require('path');
let log = require('./../../server/logger');
let publish = require('../../server/worker/queuePublisher');
let Channel = require('../../server/worker/queueClient');
const request = require('request');
let uploadedFileName = '';
let config = require('./../../env.config');
let fileDirectory = config.fileDirectory;
let storeid = '';
let url = config.domain;
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
        request.post({url: url + 'api/uploadinformations/products', json: true, form: {data: jsonObj, storeid: req.body.store_id, filename: uploadedFileName + '.csv'}}, function(err, httpResponse, body) {
          if (err) {
            log.error(err);
            cb(err, null);
          } else {
            if (body) {
              return cb(null, body);
            } else {
              let error = new Error();
              error.status = 400;
              return cb(error);
            }
          }
        });
      });
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

