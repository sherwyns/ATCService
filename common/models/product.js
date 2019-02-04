'use strict';
let multer = require('multer');
let path = require('path');
let config = require('./../../env.config');
let log = require('./../../server/logger');
let url = config.domain;

module.exports = function(Product) {
  let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './server/local-storage/images/');
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
      let path = `${url}images/` + req.files[0].filename;

      let data = {
        'store_id': req.body.store_id,
        'title': req.body.title,
        'price': req.body.price,
        'description': req.body.description,
        'category': null,
        'image': path,
      };
      let categories = req.body.category;
      let categoryData = {};
      let cat = [];
      Product.create(data, function(err, data) {
        if (err) {
          let error = new Error(err);
          error.status = 400;
          return cb(error);
        }
        // let categoryid  = '';
        // for (let item of categories) {
        //   categoryid  = item;
        // };
        let db =  Product.dataSource;
        let sql = `INSERT INTO productcategory  VALUES (NULL, '${categories}', '${data.id}');`;
        db.connector.execute(sql, function(err2, res2) {
          if (err2) {
            let error = new Error(err2);
            error.status = 400;
            return cb(error);
          }
          cb(null, res2);
        });
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

  Product.edit = function(req, res, cb) {
    let upload = multer({storage: storage}).array('product', 12);
    upload(req, res, async (err) => {
      try{
      if (err) {
        let error = new Error(err);
        error.status = 400;
        return cb(error);
      }
      let data = {};
      // console.log('files=>', req.files[0]);
      // console.log('data=>', req.body);
      let file = req.files[0];
      if (file) {
        let path = `${url}images/` + req.files[0].filename;
        data = {
          'store_id': Number(req.body.store_id),
          'title': req.body.title,
          'description': req.body.description,
          'image': path,
        };
      } else {
        data = {
          'store_id': Number(req.body.store_id),
          'title': req.body.title,
          'description': req.body.description,
          'image': req.body.image,
        };
      }
      if(req.body.price != null && req.body.price != 'null'){
        data.price = req.body.price;
      } 
      if( (req.body.shopifycategory == 'null' && req.body.productCategoryId != 0 ) || !req.body.shopifycategory) {
        Product.updateAll({id: Number(req.body.product_id)}, data, function(err, res) {
          if (err) {
            log.error(err);
          }
          let db =  Product.dataSource;
          let sql = `UPDATE productcategory SET catgory_id = ${req.body.productCategoryId} WHERE product_id = ${req.body.product_id}`;
          db.connector.execute(sql, function(err2, res2) {
            if (err2) {
              log.error(err2);
            }
            return cb(null, res2);
          });
       });
      } else if (req.body.shopifycategory && req.body.productCategoryId != 0) {
        data.category = null;
        if(req.body.dbcategory){
          data.category = req.body.dbcategory;
        }
          let type = !req.body.dbcategory ? "shopify" : 'atc';
          let res = await Product.prototype.uppdateProduct(req.body, data, req.body.product_id, type);
          return cb(null, res);
      }  
        } catch (err) {
          log.error(err);
        }      
    });
  };

  Product.prototype.uppdateProduct = async (req, data, productid, type) => {
    try{
          let updateProduct = await Product.prototype.updateDbProduct(data, productid);
          if(type == 'shopify'){
          if(updateProduct){
            let productids = await Product.prototype.getProductIds(req, data);
            for(let item of productids) {
              await Product.prototype.insertProductCategories(req, item.id);
              await Product.prototype.updateshopifycategory(item.id);
            } 
          }
          } else if(type == 'atc'){
             if(updateProduct){
              let productids = await Product.prototype.getAtcProductIds(req, data);
              for(let item of productids) {
                await Product.prototype.insertProductCategories(req, item.id);
                await Product.prototype.updateAtcCategory(item.id);
              }
            }   
          }

        } catch (err) {
          throw err;
          //log.error(err);
  
        }
  }
  Product.prototype.updateDbProduct = (data, productid) => {
    return new Promise( async (resolve, reject) => {
      try {
         Product.updateAll({id: Number(productid)}, data, function(err, res) {
          if (err) {
            return reject(err);
          }
          resolve(true);
        });
      } catch (err) {
         reject(err);
      }
    });    
  }

  Product.prototype.updateshopifycategory = (productid) => {
    return new Promise( async (resolve, reject) => {
      try {
            let db =  Product.dataSource;
            let sql = `UPDATE product SET shopifycategory = NULL WHERE id = ${productid}`;
            db.connector.execute(sql, function(err, res) {
            if (err) {
                return reject(err);
            }
            resolve(true);
          });
      } catch (err) {
         reject(err);
      }
    });    
  }  

  Product.prototype.updateAtcCategory = (productid) => {
    return new Promise( async (resolve, reject) => {
      try {
            let db =  Product.dataSource;
            let sql = `UPDATE product SET category = NULL WHERE id = ${productid}`;
            db.connector.execute(sql, function(err, res) {
            if (err) {
                return reject(err);
            }
            resolve(true);
          });
      } catch (err) {
         reject(err);
      }
    });    
  } 
  Product.prototype.insertProductCategories = (req, productid) => {
    return new Promise( async (resolve, reject) => {
        try {
              let db =  Product.dataSource;
              let sql = `INSERT INTO productcategory  VALUES (NULL, '${req.productCategoryId}', '${productid}');`;
              db.connector.execute(sql, function(err, res) {
              if (err) {
                  return reject(err);
              }
              resolve(true);
            });
        } catch (err) {
           reject(err);
        }
    });
  }  

  Product.prototype.getAtcProductIds = (req, data) => {
    return new Promise( async (resolve, reject) => {
      try {
        let db =  Product.dataSource;
        let sql = `SELECT id FROM product WHERE category = '${req.dbcategory}'`;
        db.connector.execute(sql, function(err, res) {
          if (err) {
            return reject(err);
          }
          resolve(JSON.parse(JSON.stringify(res)));
        });


      } catch (err) {
         reject(err);
      }
  });
  }  


  Product.prototype.getProductIds = (req, data) => {
    return new Promise( async (resolve, reject) => {
        try {
          let db =  Product.dataSource;
          let sql = `SELECT id FROM product WHERE shopifycategory = '${req.shopifycategory}'`;
          let params = [req.shopifycategory];
          db.connector.execute(sql, function(err, res) {
            if (err) {
              return reject(err);
            }
       
            resolve(JSON.parse(JSON.stringify(res)));
          });


        } catch (err) {
           reject(err);
        }
    });
}  

  Product.prototype.getProductIds = (req, data) => {
    return new Promise( async (resolve, reject) => {
        try {
          let db =  Product.dataSource;
          let sql = `SELECT id FROM product WHERE shopifycategory = '${req.shopifycategory}'`;
          let params = [req.shopifycategory];
          db.connector.execute(sql, function(err, res) {
            if (err) {
              return reject(err);
            }
       
            resolve(JSON.parse(JSON.stringify(res)));
          });


        } catch (err) {
           reject(err);
        }
    });
}

  Product.remoteMethod('edit', {
    description: 'API to update product information.',
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/edit',
      verb: 'post',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });

  Product.deleteselect = function(req, res, cb) {
    let data = req.body;
    let db =  Product.dataSource;
    let sql = `DELETE from product WHERE id IN (${data.toString()})`;
    db.connector.execute(sql, function(err, data) {
      if (err) {
        let error = new Error(err);
        error.status = 400;
        return cb(error);
      }
      cb(null, data);
    });
  };

  Product.remoteMethod('deleteselect', {
    description: 'API to update product information.',
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/deleteselect',
      verb: 'post',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });

  Product.getproductbystore = function(req, res, cb) {
    try {
      let db =  Product.dataSource;
      let sql = `SELECT pd.id, pd.store_id, pd.title, pd.description, pd.price, pd.image as product_image,  cat.id as category_id, cat.name as category_name FROM product as pd 
                  JOIN productcategory as pdc
                  ON pdc.product_id = pd.id
                  JOIN productcategories as cat
                  ON cat.id = pdc.catgory_id
                  WHERE pd.store_id = ${req.params.id}`;
      db.connector.execute(sql, function(err, products) {
        if (err) {
          let error = new Error(err);
          error.status = 400;
          return cb(error);
        }

        cb(null, products);
      });
    } catch (err) {
      console.error(err);
    }
  };

  Product.remoteMethod('getproductbystore', {
    description: 'API to get store details.',
    accepts: [
          {arg: 'req', type: 'object', http: {source: 'req'}},
          {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/getproductbystore/:id',
      verb: 'get',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });

  Product.appproductsbystore = function(req, res, cb) {
    try {
      let products = [];
      let db =  Product.dataSource;
      // let sql = `SELECT pd.id, pd.store_id, pd.title, pd.description, pd.price, pd.image as product_image,  cat.id as category_id, cat.name as category_name, cat.image_url as category_image FROM product as pd
      //             JOIN ProductCategory as pdc
      //             ON pdc.product_id = pd.id
      //             JOIN category as cat
      //             ON cat.id = pdc.catgory_id
      //             WHERE pd.store_id = ${req.params.id}`;

      let sql = `SELECT  Distinct pd.title, pdc.catgory_id as category_id, pd.category as dbcategory_name,
                  (IF(ISNULL(pd.category), (IF(ISNULL(pd.shopifycategory),
                  (SELECT name from productcategories WHERE id = pdc.catgory_id), pd.shopifycategory)), pd.category))as category_name, pd.shopifycategory, pd.description, pd.image as product_image, pd.price, pd.id FROM product as pd
                  LEFT JOIN productcategory as pdc
                  ON pdc.product_id = pd.id
                  WHERE pd.store_id = ${req.params.id} ORDER BY pd.id ASC`;

      db.connector.execute(sql, function(err, res) {
        if (err) {
          let error = new Error(err);
          error.status = 400;
          return cb(error);
        }
        res.forEach((item) => {
          let rowData = [];
          rowData.push(item.title);
          rowData.push(item.category_name);
          rowData.push(item.category_id);
          rowData.push(item.description);
          rowData.push(item.product_image);
          rowData.push(item.price);
          rowData.push(item.id);
          rowData.push(item.dbcategory_name);
          rowData.push(item.shopifycategory);
          products.push(rowData);
        });

       // console.log(products);

        cb(null, products);
      });
    } catch (err) {
      console.error(err);
    }
  };

  Product.remoteMethod('appproductsbystore', {
    description: 'API to get store details.',
    accepts: [
          {arg: 'req', type: 'object', http: {source: 'req'}},
          {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/appproductsbystore/:id',
      verb: 'get',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });

  Product.getproducts = function(req, res, cb) {
    // let db =  Product.dataSource;
    cb(null, 'gotit');
  };
  Product.remoteMethod('getproducts', {
    description: 'API to get all products.',
    accepts: [
          {arg: 'req', type: 'object', http: {source: 'req'}},
          {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/getproducts',
      verb: 'get',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });
};
