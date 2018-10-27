'use strict';
let log = require('./../../server/logger');

module.exports = function(Socialuser) {
  Socialuser.signup = (req, cb) => {
    try {
      if (!req.body.email || !req.body.username || req.body.email === '' || req.body.username === '' ||
      !req.body.externalid || !req.body.provider || req.body.externalid === '' || req.body.provider === '') {
        let error = new Error('Check the Input Fields');
        error.status = 400;
        return cb(error);
      } else {
        Socialuser.app.models.User.findOne({'where': {'email': req.body.email}}, (err, user) => {
          if (!user) {
            Socialuser.prototype.createUser(req, cb);
          } else {
            let db =  Socialuser.dataSource;
            let sql = `SELECT * FROM User JOIN socialUser AS su ON su.userId = User.id
                        WHERE User.email = '${req.body.email}'
                        AND su.externalId = '${req.body.externalid}'
                        AND su.provider = '${req.body.provider}'`;
            db.connector.execute(sql, function(err, data) {
              if (err)
                throw (err);
              if (data.length < 1) {
                Socialuser.prototype.createUser(req, cb);
              } else {
                cb(null, {message: 'user already exists'});
              }
            });
          }
        });
      }
    } catch (err) {
      log.error(err);
      console.log(err);
    }
  };

  Socialuser.prototype.createUser =  function(req, cb) {
    try {
      Socialuser.app.models.User.create({
        'username': req.body.username,
        'email': req.body.email,
        'password': 'atc@123',
        'emailVerified': false,
      }, function(err, userRes) {
        if (err)
          throw err;
        if (userRes) {
          Socialuser.create({
            'userId': userRes.id,
            'provider': req.body.provider,
            'externalId': req.body.externalid,
          }, function(err, socialRes) {
            if (err)
              throw err;
            if (socialRes) {
              Socialuser.app.models.AccessToken.createAccessTokenId(function(errToken, Token) {
                if (errToken) {
                  return cb(errToken, null);
                } else {
                  Socialuser.app.models.AccessToken.create({
                    'id': Token,
                    'ttl': 1209600,
                    'created': new Date(),
                    'userId': userRes.id,
                  }, function(err, userToken) {
                    cb(null, userToken);
                  });
                }
              });
            }
          });
        }
      });
    } catch (err) {
      throw err;
    }
  };

  Socialuser.signin = (req, cb) => {
    try {
      let db =  Socialuser.dataSource;
      let sql = `SELECT User.id FROM User JOIN socialUser AS su ON su.userId = User.id 
                WHERE User.email = '${req.body.email}'
                AND su.externalId = '${req.body.externalid}'
                AND su.provider = '${req.body.provider}'`;
      db.connector.execute(sql, function(err, data) {
        if (err)
          throw (err);
        if (data.length === 1) {
          Socialuser.app.models.AccessToken.createAccessTokenId(function(errToken, Token) {
            if (errToken) {
              return cb(errToken, null);
            } else {
              Socialuser.app.models.AccessToken.create({
                'id': Token,
                'ttl': 1209600,
                'created': new Date(),
                'userId': data[0].id,
              }, function(err, userToken) {
                cb(null, userToken);
              });
            }
          });
        } else {
          cb(null, {message: 'No User'});
        }
      });
    } catch (err) {
      log.error(err);
      console.log(err);
    }
  };

  Socialuser.remoteMethod('signup', {
    description: 'Create user by Facebook or Google',
    accepts: [
            {arg: 'req', type: 'object', http: {source: 'req'}},
    ],
    returns: {
      arg: 'res', type: 'object', root: true,
    },

    http: {path: '/signup', verb: 'post'},
  });

  Socialuser.remoteMethod('signin', {
    description: 'Login by Facebook or Google',
    accepts: [
                {arg: 'req', type: 'object', http: {source: 'req'}},
    ],
    returns: {
      arg: 'res', type: 'object', root: true,
    },
    http: {path: '/signin', verb: 'post'},
  });
};
