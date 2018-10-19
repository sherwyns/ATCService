'use strict';

module.exports = function(Uploadinformation) {
  Uploadinformation.products = function(req, res, cb) {
    // console.log('bnmbtgyhgfhn', req.body);
    let products = req.body.data;
    let storeid  = req.body.storeid;
    products.forEach((product) => {
      if (product.name === '') {

      }
    });
    res.json(products);
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
