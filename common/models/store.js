'use strict';
let log = require('./../../server/logger');
let multer = require('multer');
let path = require('path');
let config = require('./../../env.config');
let url = config.domain;

module.exports = function(Store) {
  Store.getstores = function(req, res, cb) {
    try {
      let db =  Store.dataSource;
      let sql = `SELECT id, shop_name, store_url, image, business_type, latitude, longitude, neighbourhood, (SELECT group_concat(CONCAT(COALESCE(cat.id,''), ':', COALESCE(cat.name,''), ':', COALESCE(cat.image_url,'NULL'))SEPARATOR ',') FROM StoreCategory as stc
                 JOIN category as cat
                 on stc.categoty_id = cat.id
                 WHERE stc.store_id = st.id) as category FROM Store as st`;
      db.connector.execute(sql, function(err, stores) {
        if (err) {
          let error = new Error(err);
          error.status = 400;
          return cb(error);
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

        cb(null, stores);
      });
    } catch (err) {
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

  Store.getstore = function(req, res, cb) {
    try {
      let db =  Store.dataSource;
      let sql = `SELECT id, user_id, shop_name, store_url, image, tagline, timezone, workinghours, description, latitude, longitude, neighbourhood,
      (SELECT group_concat(CONCAT(COALESCE(cat.id,''), ':', COALESCE(cat.name,''), ':', COALESCE(cat.image_url,'NULL'))SEPARATOR ',') FROM StoreCategory as stc
      JOIN category as cat
      on stc.categoty_id = cat.id
      WHERE stc.store_id = st.id) as category,
      (SELECT CONCAT(ad.adddressone, ':', ad.city, ':', ad.state,':', ad.zipcode, ':', ad.phonenumber)  FROM address as ad WHERE ad.store_id = st.id) as contact 
      FROM Store as st WHERE st.id = ${req.params.id}`;
      db.connector.execute(sql, function(err, stores) {
        if (err) {
          let error = new Error(err);
          error.status = 400;
          return cb(error);
        }
        stores.forEach((item) => {
          if (item.category) {
            let category = item.category.split(',');
            let j = 0;
            let storeCategory = [];
            category.forEach((cat)=>{
              let val = cat.split(':');
              let img = val[2] === 'NULL' ? null : val[2];
              storeCategory[j] = {'id': val[0], 'name': val[1], 'image_url': img};
              j++;
            });
            // let wrkhrs = item.workinghours;
            // console.log(wrkhrs);
            // item.workinghours = wrkhrs.replace(/\\"/gi, ''); ;
            item.category = storeCategory;
          }
          let contact = item.contact.split(':');
          // console.log(contact);
          item.address = contact[0];
          item.city = contact[1];
          item.state = contact[2];
          item.zipcode = contact[3];
          item.phonenumber = contact[4];
          item.contact = null;
        });
        cb(null, stores);
      });
    } catch (err) {
      console.error(err);
      log.error(err);
    }
  };

  Store.remoteMethod('getstore', {
    description: 'API to get store details.',
    accepts: [
          {arg: 'req', type: 'object', http: {source: 'req'}},
          {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/getstore/:id',
      verb: 'get',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });

  Store.getstorebyuser = function(req, res, cb) {
    try {
      let db =  Store.dataSource;
      let sql = `SELECT id, user_id, shop_name, store_url, image, tagline, timezone, workinghours, description, latitude, longitude, neighbourhood,
      (SELECT group_concat(CONCAT(COALESCE(cat.id,''), ':', COALESCE(cat.name,''), ':', COALESCE(cat.image_url,'NULL'))SEPARATOR ',') FROM StoreCategory as stc
      JOIN category as cat
      on stc.categoty_id = cat.id
      WHERE stc.store_id = st.id) as category,
      (SELECT CONCAT(ad.adddressone, ':', ad.addresstwo, ':', ad.city, ':', ad.state,':', ad.zipcode, ':', ad.phonenumber)  FROM address as ad WHERE ad.store_id = st.id) as contact 
      FROM Store as st WHERE st.user_id = ${req.params.id}`;
      db.connector.execute(sql, function(err, stores) {
        if (err) {
          let error = new Error(err);
          error.status = 400;
          return cb(error);
        }
        stores.forEach((item) => {
          if (item.category) {
            let category = item.category.split(',');
            let j = 0;
            let storeCategory = [];
            category.forEach((cat)=>{
              let val = cat.split(':');
              let img = val[2] === 'NULL' ? null : val[2];
              storeCategory[j] = {'id': val[0], 'name': val[1], 'image_url': img};
              j++;
            });
            // let wrkhrs = item.workinghours;
            // console.log(wrkhrs);
            // item.workinghours = wrkhrs.replace(/\\"/gi, ''); ;
            item.category = storeCategory;
          }
          let contact = item.contact.split(':');
          console.log(contact);
          item.addressone = contact[0];
          item.addresstwo = contact[1];
          item.city = contact[2];
          item.state = contact[3];
          item.zipcode = contact[4];
          item.phonenumber = contact[5];
          item.contact = null;
        });
        cb(null, stores);
      });
    } catch (err) {
      console.error(err);
      log.error(err);
    }
  };

  Store.remoteMethod('getstorebyuser', {
    description: 'API to get store details.',
    accepts: [
          {arg: 'req', type: 'object', http: {source: 'req'}},
          {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/getstorebyuser/:id',
      verb: 'get',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });

  let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './server/local-storage/images/');
    },
    filename: (req, file, cb) => {
      let ext = path.extname(file.originalname);
      cb(null, file.fieldname + '_' + Date.now() + ext);
    },
  });
  Store.add = function(req, res, cb) {
    try {
      let upload = multer({storage: storage}).array('store', 12);
      upload(req, res, function(err) {
        if (err) {
          let error = new Error(err);
          error.status = 400;
          return cb(error);
        }
        let path = `${url}images/` + req.files[0].filename;
        let data = {
          'shop_name': req.body.name,
          'user_id': req.body.user_id,
          'name': req.body.name,
          'store_url': req.body.storeurl,
          'business_type': req.body.business_type,
          'timezone': req.body.timezone,
          'workinghours': req.body.workinghours,
          'image': path,
          'tagline': req.body.tagline,
          'description': req.body.description,
          "neighbourhood":req.body.neighbourhood,
          'latitude': 0,
          'longitude': 0,
        };
        Store.create(data, function(err, res) {
          if (err) {
            let error = new Error(err);
            error.status = 400;
            return cb(error);
          }
          // let addressdata = {
          //   'user_id': req.body.user_id,
          //   'store_id': res.id,
          //   'contact_name': req.body.name,
          //   'adddressone': req.body.addressone,

          //   'city': req.body.city,
          //   'state': req.body.state,
          //   'zipcode': req.body.postalcode,
          //   'phonenumber': req.body.phonenumber,
          // };
          let db =  Store.dataSource;
          let sql = `INSERT INTO address (id, user_id, store_id, contact_name, adddressone, addresstwo, suite, city, state, zipcode, phonenumber, created_at, modified_at) VALUES (NULL, '${req.body.user_id}', '${res.id}', '${req.body.name}', '${req.body.addressone}', '${req.body.addresstwo}', NULL, '${req.body.city}', '${req.body.state}', '${req.body.postalcode}', '${req.body.phonenumber}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
          db.connector.execute(sql, function(err, res1) {
            if (err) {
              let error = new Error(err);
              error.status = 400;
              return cb(error);
            }
          //  // cb(null, res1);
          //   let sql2 = `INSERT INTO StoreCategory (id, store_id, categoty_id) VALUES (NULL, '${res.id}', '${req.body.business_type}')`;
          //   db.connector.execute(sql2, function(err2, res2) {
          //     if (err2) {
          //       let error = new Error(err2);
          //       error.status = 400;
          //       return cb(error);
          //     }
          //     cb(null, res2);
          //   });
          });

          let sql2 = `INSERT INTO StoreCategory (id, store_id, categoty_id) VALUES (NULL, '${res.id}', '${req.body.business_type}')`;
          db.connector.execute(sql2, function(err2, res2) {
            if (err2) {
              let error = new Error(err2);
              error.status = 400;
              return cb(error);
            }
            cb(null, res2);
          });
          // Store.app.models.address.create(addressdata, function(err1, res1) {
          //   if (err) {
          //   let error = new Error(err);
          //   error.status = 400;
          //   return cb(error);
          // }
          // cb(res.id);
          // });
        });
      });
    } catch (err) {
      console.log(err);
    }
  };

  Store.remoteMethod('add', {
    description: 'API to save store details.',
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

  Store.edit = function(req, res, cb) {
    let upload = multer({storage: storage}).array('store', 12);
    upload(req, res, function(err) {
      if (err) {
        let error = new Error(err);
        error.status = 400;
        return cb(error);
      }
      let data = {};
      let file = req.files[0];
      if (file) {
        let path = `${url}images/` + req.files[0].filename;
        data = {
          'shop_name': req.body.name,
          'user_id': Number(req.body.user_id),
          'name': req.body.name,
          'store_url': req.body.storeurl,
          'business_type': 2,
          'timezone': req.body.timezone,
          'workinghours': req.body.workinghours,
          'image': path,
          'tagline': req.body.tagline,
          'description': req.body.description,
          "neighbourhood":req.body.neighbourhood,
          'latitude': 0,
          'longitude': 0,
        };
      } else {
        data = {
          'shop_name': req.body.name,
          'user_id': Number(req.body.user_id),
          'name': req.body.name,
          'store_url': req.body.storeurl,
          'business_type': 2,
          'timezone': req.body.timezone,
          'workinghours': req.body.workinghours,
          'image': req.body.image,
          'tagline': req.body.tagline,
          'description': req.body.description,
          "neighbourhood":req.body.neighbourhood,
          'latitude': 0,
          'longitude': 0,
        };
      }
      Store.updateAll({id: Number(req.body.store_id)}, data, function(err, res) {
        if (err) {
          let error = new Error(err);
          error.status = 400;
          return cb(error);
        }

       // cb(null, res);
        let address = {
          'user_id': req.body.user_id,
          'store_id': req.body.store_id,
          'contact_name': req.body.name,
          'adddressone': req.body.addressone,
          'addresstwo': req.body.addresstwo,
          'city': req.body.city,
          'state': req.body.state,
          'zipcode': req.body.postalcode,
          'phonenumber': req.body.phonenumber,
        };

        Store.app.models.address.updateAll({store_id: Number(req.body.store_id)}, address, function(err1, res1) {
          if (err1) {
            let error = new Error(err1);
            error.status = 400;
            return cb(error);
          }
        });
      });
      let storecategory = {
        categoty_id: req.body.business_type,
      };

      let db =  Store.dataSource;
      let sql = `UPDATE StoreCategory SET categoty_id = ${Number(req.body.business_type)} WHERE store_id = ${Number(req.body.store_id)}`;
      db.connector.execute(sql, function(err2, res2) {
        if (err2) {
          let error = new Error(err2);
          error.status = 400;
          return cb(error);
        }
        cb(null, res2);
      });
    });
  };

  Store.remoteMethod('edit', {
    description: 'API to edit store details.',
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
  Store.user = async (req, res, cb) => {
    try {
      let data = {};
      if(req.body.businessname && req.body.newemail && req.body.currentpassword && req.body.newpassword){
          let isEmailExist = await Store.prototype.checkEmailExist(req.body.newemail);
          if(!isEmailExist){
              let changePassword = await Store.prototype.changePassword(req.body.currentpassword, req.body.newpassword, req.body.accesstoken);
              if(changePassword){
                  let businessname = await Store.prototype.saveBusinessName (req.body.user_id, req.body.businessname, req.body.newemail);
                  return {"email":false, "password":true, "user": true};
              } else {
                return {"email":false, "password":true, "user": false};
              }    
          } else {
            return {"email":true, "password":false, "user": false};
          }
      } else if (req.body.businessname && req.body.newemail) {
          let isEmailExist = await Store.prototype.checkEmailExist(req.body.newemail);
          if(!isEmailExist){
            let businessname = await Store.prototype.saveBusinessName (req.body.user_id, req.body.businessname, req.body.newemail);
            return {"user":true, "email": false, "password": false};
          } else {  
            return {"user":false, "email":true, "password": false};
          }
      } else if(req.body.businessname && req.body.currentpassword && req.body.newpassword) {
          let changePassword = await Store.prototype.changePassword(req.body.currentpassword, req.body.newpassword, req.body.accesstoken);
          if(changePassword){
              let businessname = await Store.prototype.saveBusinessName (req.body.user_id, req.body.businessname, null);
              return {"user":true, "email":false, "password": false};
          } else {
            return {"user":false, "email":false, "password": true};
          }   
      } else  if (req.body.businessname ){
          let businessname = await Store.prototype.saveBusinessName (req.body.user_id, req.body.businessname);
          return {"user":true,"email":false, "password": false};

      }
    } catch (err) {
        console.log(err);
    }
  };

  Store.prototype.saveBusinessName = (user_id, businessname, email) => {
    return new Promise( async (resolve, reject) => {  
    try{
          let data = {};
          data.username = businessname;
          if(email){
            data.email = email;
          }
          Store.app.models.User.update({id: user_id}, data, function(err, res) {
            resolve(true);
          }); 
      }catch(err){
        reject (err);
      }
    });      
  }

  Store.prototype.changePassword = (currentpassword, newpassword, accesstoken) =>{
    return new Promise( async (resolve, reject) => {
      try {
        // Store.app.models.User.prototype.changePassword(currentpassword, newpassword, function(err, res){
        //   console.log(err);
        //   console.log("res", res);
        // });
        request.post({url: url+'api/Users/change-password?access_token='+accesstoken,  json: true, form: {oldPassword: currentpassword, newPassword: newpassword}}, function(err, httpResponse, body) {
          if(err){
            reject (err);
          } else {
            if(body){
              resolve (false);
            } else {
              resolve(true);
            }
           }
        });        
  
      }catch(err){
          reject (err);
      }
    });   
  }

  Store.prototype.checkEmailExist = (email) => {
    return new Promise((resolve, reject) => {
      try {
        let db =  Store.dataSource;
        let sql = `SELECT count(*) as emailexists FROM User WHERE email=?`;
        let params = [email]
        db.connector.execute(sql, params, function(err2, res2) {
          if(err2){
            reject (err2);
          }
          if(res2[0].emailexists == 1){
            resolve(true);
          } else  if(res2[0].emailexists == 0){
            resolve(false);
          }
        }); 
  
  
      }catch(err){
          reject (err);
      }
    });
  };

  
  Store.remoteMethod('user', {
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/user',
      verb: 'post',
    },
    returns: {
      arg: 'data',
      type: 'object'
    },
  });

  Store.remoteMethod('edit', {
    description: 'API to edit store details.',
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
  Store.getaccdetails = function(req, res, cb) {
    let db =  Store.dataSource;
    let sql = `SELECT id as userid, username, email, (SELECT id FROM Store as st WHERE st.user_id = us.id) as storeid, (SELECT  IF(id != NULL, NULL, (SELECT COUNT(id) FROM product as pt WHERE pt.store_id = st.id)) FROM Store as st WHERE st.user_id = us.id) as productcount  
                FROM User as us
                WHERE us.id = ${req.body.userid}`;
    db.connector.execute(sql, function(err, res) {
      if (err) {
        let error = new Error(err);
        error.status = 400;
        console.log(error);
        return cb(error);
      }
      // console.log(res);
      cb(null, res);
    });
  };

  Store.remoteMethod('getaccdetails', {
    description: 'API to edit store details.',
    accepts: [
      {arg: 'req', type: 'object', http: {source: 'req'}},
      {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/getaccdetails',
      verb: 'post',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });
};
