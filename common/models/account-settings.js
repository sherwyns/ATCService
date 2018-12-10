'use strict';
let disableMethods = require('../../server/disable-methods');
module.exports = function(Accountsettings) {
  Accountsettings.user = function(req, res, cb) {
        // console.log("req");
    console.log(req);

    let data = {
      'user_id': req.body.user_id,
      'businessname': req.body.businessname,
    };
        // data.user_id = req.body.user_id;
        // if(req.body.businessname){
        //   data.businessname = req.body.businessname;
        // }
        // if(req.body.email){
        //   data.email = req.body.newemail;
        // }
        // if(req.body.password){
        //   data.password = req.body.newpassword;
        // }
    console.log('data', data);
  };

  Accountsettings.remoteMethod('user', {
    description: 'API to edit user details.',
    accepts: [
              {arg: 'text', type: 'string', http: {source: 'req'}},
              {arg: 'req', type: 'object', http: {source: 'req'}},
              {arg: 'res', type: 'object', http: {source: 'res'}},
    ],
    http: {
      path: '/user',
      verb: 'post',
    },
    returns: {
      arg: 'data',
      type: 'object',

    },
  });
};
