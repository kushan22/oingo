const express = require('express');
const db = require('../config/database_conn');


const router = express.Router();
var sess;
module.exports = () => {
    router.get('/',(req,res,next)=>{
        sess = req.session;
        if (!sess.sessId){
            return res.render('registration',{
                page:'Registration',
                flag:0
            });
        
        
        }else{
            var userId = sess.sessId;
            //console.log(userId);
            var userFullName = "";
            var sql = "SELECT fullname from user where uid='"+userId+"'";
            db.query(sql,(err,result)=>{
                if (result.length > 0){
                    userFullName = result[0].fullname;
                   // console.log(userFullName);

                    return res.render('home',{
                        page:'Home Page',
                        success:true,
                        id:userId,
                        name:userFullName
                        
                    });
                }
            });
            
        }

       
    });

    router.post('/register',(req,res,next) =>{
        console.log(req.body);
        const fullName = req.body.fullname.trim();
        const username = req.body.username.trim();
        const email = req.body.email.trim();
        const password = req.body.password.trim();
        const profilePic = "default";
        const state = "defaultState";

        if (!fullName || !username || !email || !password){
            return res.render('registration',{
                page: 'Registration',
                flag:1
            });
        }

        const sql = "INSERT INTO user (uname,email,profilepic,password,fullname,state) VALUES('"+username+"','"+email+"','"+profilePic+"','"+password+"','"+fullName+"','"+state+"')";
        db.query(sql,(err,result)=>{
            if (err){
                successfulRegistration = false;
                return res.render('registration',{
                    page: 'Registration',
                    flag:2
                });
                
            }else{
                return res.render('registration',{
                    page: 'Registration',
                    flag:3
                });
            }
           

        });

       

        
    });

    router.post('/login',(req,res,next)=>{
        console.log(req.body);
        const userName = req.body.username.trim();
        const password = req.body.password.trim();
    

        db.query("SELECT * FROM user where uname='"+userName+"' and password='"+password+"'",
            (err,result)=>{
                if (result.length == 0){
                    res.render('registration',{
                        page:'Registration',
                        flag:4
                    })
                }else{

                    
                    sess = req.session;
                    sess.sessId = result[0].uid;
                    return res.render('home',{
                        page:'Home Page',
                        success:true,
                        id:result[0].uid,
                        name:result[0].fullname
                       });
                }
               
                
                
            });

        //return res.render('registration');
       
       
    });

    return router;
};