'use strict';
let log = require('./../../server/logger');
let disableMethods = require('../../server/disable-methods');

module.exports = function(Category) {
  Category.list = function(cb) {
    try {
      let db =  Category.dataSource;
      let sql = 'SELECT id, name,  image_url FROM `category` WHERE id NOT IN(SELECT DISTINCT parent_id FROM category) ORDER BY name ASC';
      db.connector.execute(sql, function(err, categories) {
        if (err)
          throw (err);
        cb(err, categories);
      });
    } catch (err) {
      log.error(err);
    }
  };

  Category.remoteMethod('list', {
    description: 'This will list all categories',
    accepts: [],
    http: {
      path: '/list',
      verb: 'get',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });

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

