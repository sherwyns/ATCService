'use strict';

let multer = require('multer');
let fs = require('fs');
var path = require('path');
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
          // limits:{
          //   fileSize: 1024 * 1024
          // }
    }).array('csvfile', 12);
    upload(req, res, function(err) {
      if (req.fileValidationError) {
        return res.json(req.fileValidationError);
      }
      if (err) {
           // console.log(err);
        return res.json(err);
      }
         // console.log(req.files[0].filename);
        //   console.log(req.body);
      let productsCsv = fileDirectory + uploadedFileName + '.csv';
      publish({'productsCsv': productsCsv, 'storeid': req.body.store_id}, 'productbulkupload-queue', Channel).then((passed) => {
        console.log(passed);
      }).catch((err) => {
        console.log(err);
      });
    //   let jsonObj = {'name': 'ravi'};
    //   request.post({url: 'http://localhost:3000/api/uploadinformations/products', form: {data: jsonObj}}, function(err, httpResponse, body) {
    //     res.json(body);
    //   });
    });
    res.json('ok');
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
