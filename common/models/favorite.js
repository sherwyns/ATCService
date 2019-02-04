'use strict';

let log = require('./../../server/logger');
let path = require('path');
let config = require('./../../env.config');
let url = config.domain;

module.exports = function(Favorite) {
    
    Favorite.save=  async (req, res, cb) => {
        try{
            let data = req.body;
            let table =  !data.type ? null : (data.type === 'store') ? "storefavorite" : ((data.type === 'product') ? "productfavorite" : '') ;
            if(!table){
                return {status: 0};
            } else {
                let isExist = await Favorite.prototype.isItemExist(data, table);
                if(!isExist){
                    let insertData = Favorite.prototype.insertData(data, table);
                    if(!insertData){
                        return {status: 0, message: "unable to insert"}; 
                    } else {
                        return {status: 1, message: "Success!"}; 
                    }                    
                } else {
                    let updateData = Favorite.prototype.updateData(data, table);
                    if(!updateData){
                        return {status: 0, message: "unable to update"}; 
                    } else {
                        return {status: 1, message: "Success!"}; 
                    }                     
                }
            }
        } catch (err) {
            log.error(err);
        }    
    }

    Favorite.prototype.isItemExist = (data, table) => {
        return new Promise((resolve, reject) => {
            try {
                let itemColumn = table === 'storefavorite' ? 'store_id' : (table === 'productfavorite' ? 'product_id' : '')
                let db =  Favorite.dataSource;
                let sql = `SELECT count(*) as count FROM ${table} WHERE user_id = ? and ${itemColumn} = ?`;
                let params = [data.user_id, data.id]
                db.connector.execute(sql, params, function(err, res) {
                    if(err){
                        reject (err);
                    }
                    res = JSON.parse(JSON.stringify(res))
                    if(res[0].count > 0){
                        resolve(true);
                      } else  if(res[0].count == 0){
                        resolve(false);
                    }
                }); 
            }catch(err){
                reject (err);
            }
          });
    } 
    
    Favorite.prototype.insertData = (data, table) => {
        return new Promise((resolve, reject) => {
            try {
                let itemColumn = table === 'storefavorite' ? 'store_id' : (table === 'productfavorite' ? 'product_id' : '')
                let db =  Favorite.dataSource;
                let sql = `INSERT INTO ${table}  VALUES (NULL, ?, ?, ?)`;
                let params = [data.user_id, data.id, data.isfavorite]
                db.connector.execute(sql, params, function(err, res) {
                    if(err){
                        reject (err);
                    }
                    res = JSON.parse(JSON.stringify(res))
                    if(res.affectedRows > 0){
                        resolve(true);                        
                    } else {
                        resolve(false);                        
                    }
                }); 
            }catch(err){
                reject (err);
            }
          });
    }  
    
    Favorite.prototype.updateData = (data, table) => {
        return new Promise((resolve, reject) => {
            try {
                let itemColumn = table === 'storefavorite' ? 'store_id' : (table === 'productfavorite' ? 'product_id' : '')
                let db =  Favorite.dataSource;
                let sql = `UPDATE ${table} SET favorite = ? WHERE user_id = ? and ${itemColumn} = ?`;
                let params = [data.isfavorite, data.user_id, data.id]
                db.connector.execute(sql, params, function(err, res) {
                    if(err){
                        reject (err);
                    }
                    res = JSON.parse(JSON.stringify(res));
                    if(res.affectedRows > 0){
                        resolve(true);                        
                    } else {
                        resolve(false);                        
                    }
                }); 
            }catch(err){
                reject (err);
            }
          });
    }     

    Favorite.remoteMethod('save', {
        accepts: [
          {arg: 'req', type: 'object', http: {source: 'req'}},
          {arg: 'res', type: 'object', http: {source: 'res'}},
        ],
        http: {
          path: '/save',
          verb: 'post',
        },
        returns: {
          arg: 'data',
          type: 'object',
    
        },
        
      }); 


      Favorite.list=  async (req, res, cb) => {
        try{
            let data = req.body;
            let table =  !data.type ? null : (data.type === 'store') ? "storefavorite" : ((data.type === 'product') ? "productfavorite" : '') ;
            if(!table){
                return {status: 0};
            } else {
                let res = await Favorite.prototype.getData(data, table);
                return res; 
            }
        } catch (err) {
            log.error(err);
        }    
    }      

    Favorite.prototype.getData = (data, table) => {
        return new Promise((resolve, reject) => {
            try {
                let db =  Favorite.dataSource;
                let sql = `select * from ${table} WHERE user_id = ?`;
                let params = [data.user_id]
                db.connector.execute(sql, params, function(err, res) {
                    if(err){
                        reject (err);
                    }
                    res = JSON.parse(JSON.stringify(res));
                    resolve(res);
                }); 
            }catch(err){
                reject (err);
            }
          });
    }

      Favorite.remoteMethod('list', {
        accepts: [
          {arg: 'req', type: 'object', http: {source: 'req'}},
          {arg: 'res', type: 'object', http: {source: 'res'}},
        ],
        http: {
          path: '/list',
          verb: 'post',
        },
        returns: {
          arg: 'data',
          type: 'object',
    
        },
        
      });         
};
