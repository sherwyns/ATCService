'use strict';
let log = require('./../../server/logger');

module.exports = function(Category) {
  Category.remoteMethod('getCategories', {
    description: 'This will list all categories',
    accepts: [],
    http: {
      path: '/getCategories',
      verb: 'get',
    },
    returns: {
      arg: 'status',
      type: 'object',

    },
  });
  Category.getCategories = function(cb) {
    try {
      let db =  Category.dataSource;
      let sql = 'select * from category where parent_id = 0';
      db.connector.execute(sql, function(err, categories) {
        if (err)
          throw (err);
        cb(err, categories);
      });
    } catch (err) {
      log.error(err);
    }
  };

  Category.remoteMethod('getCategoriesById', {
    accepts: {
      arg: 'id',
      type: 'number',
      required: true,
      description: 'return all category by id',
    },
    http: {
      path: '/getCategories/:id',
      verb: 'get',
    },
    returns: {
      arg: 'status',
      type: 'object',

    },
  });

  Category.getCategoriesById = function(id, cb) {
    try {
      let db =  Category.dataSource;
      let sql = 'select * from category where parent_id =' + id;
      db.connector.execute(sql, function(err, categories) {
        if (err)
          throw (err);
        cb(err, categories);
      });
    } catch (err) {
      log.error(err);
    }
  };
};

