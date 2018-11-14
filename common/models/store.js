'use strict';
let log = require('./../../server/logger');

module.exports = function(Store) {
  Store.getstores = function(req, res, cb) {
    try {
      let db =  Store.dataSource;
      let sql = `SELECT id, shop_name, store_url, image, latitude, longitude, neighbourhood, (SELECT group_concat(CONCAT(COALESCE(cat.id,''), ':', COALESCE(cat.name,''), ':', COALESCE(cat.image_url,'NULL'))SEPARATOR ',') FROM StoreCategory as stc
                 JOIN category as cat
                 on stc.categoty_id = cat.id
                 WHERE stc.store_id = st.id) as category FROM store as st`;
      db.connector.execute(sql, function(err, stores) {
        if (err) {
          let error = new Error(err);
          error.status = 400;
          return cb(error);
        }
        stores.forEach((item) => {
          let category = item.category.split(',');
          let j = 0;
          let storeCategory = [];
          category.forEach((cat)=>{
            let val = cat.split(':');
            let img = val[2] === 'NULL' ? null : val[2];
            storeCategory[j] = {'id': val[0], 'name': val[1], 'image_url': img};
            j++;
          });
          item.category = storeCategory;
        });
        cb(null, stores);
      });
    } catch (err) {
      console.error(err);
      log.error(err);
    }
  };

  Store.remoteMethod('getstores', {
    description: 'API to store product information.',
    accepts: [
          {arg: 'req', type: 'object', http: {source: 'req'}},
          {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/getstores',
      verb: 'get',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });

  Store.favorite = function(req, res, cb) {
    try {
      console.log(req.body);
    } catch (err) {
      console.error(err);
    }
  };

  Store.remoteMethod('favorite', {
    description: 'API to store product information.',
    accepts: [
          {arg: 'req', type: 'object', http: {source: 'req'}},
          {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/favorite',
      verb: 'post',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });
};
