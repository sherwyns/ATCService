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
        return results;
     } catch (err) {
        log.error(err);
        console.log(err);
    }        
  };

  Search.prototype.products = (word) => {
    return new Promise((resolve,reject) => {
        try{
            let db =  Search.dataSource;
             let sql = `SELECT pd.id, pd.store_id, pd.title, pd.description, pd.price, pd.image as product_image,  cat.id as category_id, cat.name as category_name, cat.image_url as category_image FROM product as pd 
                        JOIN productcategory as pdc
                        ON pdc.product_id = pd.id
                        JOIN category as cat
                        ON cat.id = pdc.catgory_id
                        WHERE pd.title LIKE ?`
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
            let sql = `SELECT id, shop_name, store_url, image, business_type, latitude, longitude, neighbourhood, (SELECT group_concat(CONCAT(COALESCE(cat.id,''), ':', COALESCE(cat.name,''), ':', COALESCE(cat.image_url,'NULL'))SEPARATOR ',') FROM StoreCategory as stc
                        JOIN category as cat
                        on stc.categoty_id = cat.id
                        WHERE stc.store_id = st.id) as category FROM Store as st WHERE st.name LIKE ?`

            // let sql = `SELECT name, store_url, image, description, tagline, neighbourhood FROM Store
            //             WHERE MATCH(name) 
            //             AGAINST(? IN BOOLEAN MODE )`;
            let params = [word+'%'];
            db.connector.execute(sql, params, function(err, stores) {
                if(err){
                    reject (err);
                    return;
                } 
                stores.forEach((item) => {
                    if (item.category !== null) {
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
                    } else {
                      item.category = null;
                    }
                });                
                return resolve(stores);
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
