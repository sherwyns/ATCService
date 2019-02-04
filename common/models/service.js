'use strict';

let log = require('./../../server/logger');
let path = require('path');
let config = require('./../../env.config');
let url = config.domain;

module.exports = function(Service) {

    Service.email=  async (req, res, cb) => {
        try{
            let email = req.body.email;
            let redirectUrl = req.body.url;
            let isEmailExist = await Service.prototype.checkEmailExist(email);
            if(!isEmailExist){
                return {status: 0, message: "Email id is not exist"};
            } else {
                let password =  Math.random().toString(36).slice(-8);
                let hashPassword = Service.app.models.User.hashPassword(password)
                let changePassword = await Service.prototype.changePassword(email, hashPassword);
                if(!changePassword){
                    return {status: 1, message: "Change password error"};
                } else {
                    let sendMail = await Service.prototype.sendMail(email, password, redirectUrl);
                    if(!sendMail){
                        return {status: 2, message: "Email is not send"};  
                    }
                    return {status: 3};
                }                      
             }
        } catch (err) {
           // log.error(err);
           console.log(err);
        }    
    }


    Service.prototype.checkEmailExist = (email) => {
        return new Promise((resolve, reject) => {
          try {
            let db =  Service.dataSource;
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

    Service.prototype.changePassword = (email, password) =>{
        return new Promise( async (resolve, reject) => {
          try {
            Service.app.models.User.update({'email': email}, {'password': password}, function(err, res) {
                if(err){
                    let error = new Error(err);
                    error.status = 400;
                    reject(error);  
                } 
                if (res.count == 0) { 
                    resolve(false);
                } else if (res.count == 1) { 
                    resolve(true);                    
                }              
            }); 
          }catch(err){
              reject (err);
          }
        });   
    }

    Service.prototype.sendMail = (email, password, redirectUrl) =>{
        return new Promise( async (resolve, reject) => {
          try {
                let html = "";
                    html += `<div style="background-color:#2d55ff;margin:0 auto;max-width:640px;padding:0 20px"><div class="adM">
                            </div><table align="center" border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                            <tr>
                            <td>&nbsp;</td>
                            </tr>
                            <tr>
                            <td><div style="width:96%;margin:auto;padding:5px 0 0px 0"> <img src="${url}assets/atclogo.png" alt="Around The Corner" title="Around The Corner" width="125px" > </div>
                            <div style="background:#fff;color:#656464;border-radius:4px;font-family:arial;font-size:14px;padding:10px 20px;width:90%;margin:20px auto;line-height:17px;border:1px #ddd solid;border-top:0;clear:both">
                            <p style="color:#656464;" >Hi there!</p>
                            <p style="color:#656464;" >Here is your temporary password. Please use it to log into your account. Please change your password after logging in by going to My Account and selecting a new one.</p>
                            <br/>
                            <p><span style="text-decoration:none;color:#656464;font-weight:400;">Email: </span>${email}</p>
                            <p><span style="text-decoration:none;color:#656464;font-weight:400;">Password: </span>${password}</p>
                            <br/>
                            `;    
                    if(redirectUrl){        
                        html += `<button class="button" style=" background: linear-gradient(90deg, #eb5b23, #f7931d); border: none;color: white;
                            padding: 15px 32px;text-align: center;font-size: 14px;margin: 4px 2px;cursor: pointer;border-radius: 4px;">                        
                            <a style="text-decoration:none;color:white;" href="${redirectUrl}">Log in now</a></button>
                            <br/>`;
                    }
                    html += `
                            <br/>
                            <p style="font-size:11px;text-decoration:none;color:#656464;">See you soon on ATC.</p>
                            <p style="font-size:11px;text-decoration:none;color:#656464;"> ATC Care Team </p>
                            </div>
                            </td>
                            </tr>
                            </tbody>    
                            </table>
                            </div>`;

                Service.app.models.Email.send({
                    to: email,
                    from: 'password.assistance@aroundthecorner.store',
                    subject: 'ATC Password Reset',
                    text: '',
                    html: html
                }, function(err, mail) {
                    if(err) 
                        return reject(err);
                    return resolve(true);    
                });  
          }catch(err){
              reject (err);
          }
        });   
    }

    Service.remoteMethod('email', {
        accepts: [
          {arg: 'req', type: 'object', http: {source: 'req'}},
          {arg: 'res', type: 'object', http: {source: 'res'}},
        ],
        http: {
          path: '/email',
          verb: 'post',
        },
        returns: {
          arg: 'data',
          type: 'object',
    
        },
        
    }); 
      
    Service.RemoveUserDetails=  async (req, res, cb) => {
        try{
            let emailidList = req.body.email;
            for(let emailid of emailidList){
            let res = await Service.prototype.removeDetails(emailid);
            if(!res){
                return {status: 0, message: "No User"}; 
            } else {
                return {status: 1, message: "Success!"}; 
            }  
            }
        } catch (err) {
            log.error(err);
        }   

    }
    
    Service.prototype.removeDetails = (email) => {
        return new Promise((resolve, reject) => {
          try {
            let db =  Service.dataSource;
            let sql = `CALL RemoveUserDetails(?);`;
            let params = [email]
            db.connector.execute(sql, params, function(err, res) {
              if(err){
                return reject (err);
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
    };

    Service.remoteMethod('RemoveUserDetails', {
        accepts: [
            {arg: 'req', type: 'object', http: {source: 'req'}},
            {arg: 'res', type: 'object', http: {source: 'res'}},
        ],
        http: {
            path: '/removeuserdetails',
            verb: 'post',
        },
        returns: {
            arg: 'data',
            type: 'object',

        },
    
    });        

};
