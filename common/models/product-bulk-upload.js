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

module.exports = function(Productbulkupload) {
  let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './server/local-storage');
    },
    filename: (req, file, cb) => {
      uploadedFileName = file.fieldname + '_' + Date.now();
      cb(null, file.fieldname + '_' + Date.now() + '.csv');
    },
  });
  Productbulkupload.uploads = function(req, res, cb) {
    let upload = multer({
      storage: storage,
      fileFilter: function(req, file, cb) {
        let ext = path.extname(file.originalname);
        if (ext !== '.csv') {
          let msg = file.originalname + ' is not csv file. pls Upload csv file';
          req.fileValidationError = msg;
          return cb(null, false, new Error(msg));
        }
        cb(null, true);
      },
    }).array('csvfile', 12);
    upload(req, res, function(err) {
      if (req.fileValidationError) {
        log.error(req.fileValidationError);
        return res.json(msg);
      }
      if (err) {
        return res.json(err);
      }
      // console.log('test');
      console.log(req);
      // console.log(req.body);
      let productsCsv = fileDirectory + uploadedFileName + '.csv';
      publish({'productsCsv': productsCsv, 'storeid': req.body.store_id, 'filename': uploadedFileName + '.csv'}, 'productbulkupload-queue', Channel).then((passed) => {
        console.log(passed);
        cb(null, passed);
      }).catch((err) => {
        console.log(err);
        log.error(err);
        return res.json(err);
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
