'use strict';

module.exports = function(Store) {
  Store.getstores = function(req, res, cb) {
    try {
      let db =  Store.dataSource;
      let sql = `SELECT id, shop_name, store_url, image, latitude, longitude,
                 (SELECT (SELECT CONCAT(name, ', ', (CASE WHEN image_url = '-' THEN "null" ELSE image_url END)) as cat FROM category WHERE id = stc.categoty_id) as catdetails FROM StoreCategory
                  as stc WHERE store_id = st.id) as category, 0 as isfavorite,  CONCAT('omr', ',', 'velacherry') as neighbouthood  FROM store as st`;
      db.connector.execute(sql, function(err, stores) {
        if (err) {
          let error = new Error(err);
          error.status = 400;
          return cb(error);
        }
        cb(null, stores);
      });
    } catch (err) {
      console.error(err);
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
};
