'use strict';
let multer = require('multer');
let path = require('path');

module.exports = function(Product) {
  let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './server/local-storage/productimages');
    },
    filename: (req, file, cb) => {
      let ext = path.extname(file.originalname);
      cb(null, file.fieldname + '_' + Date.now() + ext);
    },
  });
  Product.add = function(req, res, cb) {
    let upload = multer({storage: storage}).array('product', 12);
    upload(req, res, function(err) {
      if (err) {
        let error = new Error(err);
        error.status = 400;
        return cb(error);
      }
      let data = {
        'store_id': req.body.store_id,
        'title': req.body.title,
        'price': req.body.price,
        'description': req.body.price,
        'category': req.body.category,
        'image': req.files[0].path,
      };
      Product.create(data, function(err, data) {
        if (err) {
          let error = new Error(err);
          error.status = 400;
          return cb(error);
        }
        cb(null, data);
      });
    });
  };

  Product.remoteMethod('add', {
    description: 'API to store product information.',
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/add',
      verb: 'post',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });
};
