'use strict';
let log = require('./../../server/logger');

module.exports = function(Search) {
  Search.by = async (req, res, cb) => {
    try{
        let results = [];
        let data = {}
        let products = await Search.prototype.products(req.params.word);
        data.products = products
        let stores = await Search.prototype.store(req.params.word);
        data.stores = stores
        results.push(data);        
        cb(null, results);
     } catch (err) {
        log.error(err);
        console.log(err);
    }        
  };

  Search.prototype.products = (word) => {
    return new Promise((resolve,reject) => {
        try{
            let db =  Search.dataSource;
             let sql = `SELECT title, price, description, image FROM product WHERE title LIKE ?`
            //             WHERE MATCH(title) 
            //             AGAINST(? IN BOOLEAN MODE )`;
            let params = [word+'%'];
            db.connector.execute(sql, params, function(err, res) {
                if(err){
                    reject (err);
                    return;
                } 
                return resolve(res);
            });    
        } catch(err){
            reject (err);
        }
    });    
  }

  Search.prototype.store = (word) => {
    return new Promise((resolve,reject) => {
        try{
            let db =  Search.dataSource;
            let sql = `SELECT name, store_url, image, description, tagline, neighbourhood FROM Store WHERE name LIKE ?`

            // let sql = `SELECT name, store_url, image, description, tagline, neighbourhood FROM Store
            //             WHERE MATCH(name) 
            //             AGAINST(? IN BOOLEAN MODE )`;
            let params = [word+'%'];
            db.connector.execute(sql, params, function(err, res) {
                if(err){
                    reject (err);
                    return;
                } 
                return resolve(res);
            });    
        } catch(err){
            reject (err);
        }
    });    
  }  

  Search.remoteMethod('by', {
    description: 'API to edit store details.',
    accepts: [
          {arg: 'req', type: 'object', http: {source: 'req'}},
          {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/by/:word',
      verb: 'GET',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });
};
