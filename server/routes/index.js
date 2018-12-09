const express = require('express');
const db = require('../config/database_conn');



const router = express.Router();
var sess;
var USER_ID,USER_NAME;
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
            console.log("Inside Route 1");
            var userFullName = "";
            var sql = "SELECT fullname from user where uid='"+userId+"'";
            db.query(sql,(err,result)=>{
                if (result.length > 0){
                    userFullName = result[0].fullname;
                    USER_ID = userId;
                    USER_NAME = userFullName;
                   
                    res.redirect('/home');
                }else{
                    return next();
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
                    USER_ID = result[0].uid;
                    USER_NAME = result[0].fullname;
                    res.redirect('/home');
                }
               
                
                
            });

        //return res.render('registration');
       
       
    });

    router.post('/logout',(req,res,next)=>{
        req.session.destroy((err)=>{
            if (err){
                console.log("Error");
            }else{
                // return res.render('registration',{
                //     page:'Registration',
                //     flag:0
                // });
                console.log("Inside Logout");
                res.redirect('/');
            }
        });
    });

    router.get('/home/createPost',(req,res,next) => {
        console.log("Called Create Post");
        sess = req.session;
        var userid = sess.sessId;
        return res.render('createPost');
    });


    // Home Router
    router.get('/home',(req,res,next)=>{
            //req.connection.setTimeout(0);
            // var num_of_posts;
            console.log("Called")
            var sql = "SELECT Count(*) as postCount FROM posts where uid = '"+USER_ID+"'";
            db.query(sql,(err,result) => {
                if (result.length == 0){
                    console.log("Zero Results");
                }else{
                    console.log(result);
                    return res.render('home',{
                        page:'Home Page',
                        success:true,
                        id:USER_ID,
                        name:USER_NAME
                        
                       });
                }
            });
       


      

    


         
    });

    router.post('/home/createPost',(req,res,next) => {
        return res.send('Awesome');
    });


    
    return router;
};