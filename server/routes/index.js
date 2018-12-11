const express = require('express');
const db = require('../config/database_conn');
const promiseDb = require('../config/promisedatabaseconn');


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
    router.get('/home',async (req,res,next)=>{
            //req.connection.setTimeout(0);
            var num_of_posts=1,num_of_friends=1,num_of_filters=1;
            console.log("Called");

            try{
                var sql = "SELECT Count(*) as postCount FROM posts where uid = '"+USER_ID+"'";
                var resultPost = await promiseDb.query(sql);
                num_of_posts = resultPost[0]['postCount'];

                var sql1 = "SELECT Count(*) as friendCount FROM friends where u1id = '"+USER_ID+"' OR u2id = '"+USER_ID+"'";
                var resultFriend = await promiseDb.query(sql1);
                num_of_friends = resultFriend[0]['friendCount'];

                var sql2 = "SELECT Count(*) as filterCount FROM filter_save where uid = '"+USER_ID+"'";
                var resultFilter = await promiseDb.query(sql2);
                num_of_filters = resultFilter[0]['filterCount'];
                

                return res.render('home',{
                    page:'Home Page',
                    success:true,
                    id:USER_ID,
                    name:USER_NAME,
                    posts:num_of_posts,
                    friends:num_of_friends,
                    filters:num_of_filters
                    
                   });
            }catch(err){
                throw new Error(Err);
            }
            
            

            
       


      

    


         
    });

    router.post('/home',(req,res,next) => {
       // console.log(req.body);
        var postDesc = req.body.postDescription.trim();
        var postTags = req.body.postTags.trim();
        var state = req.body.state.trim();
        var loc = req.body.postLocation.trim();
        var radius = req.body.postRadius.trim();
        var sch1 = req.body.Schedule1;

       

       
        
        var fromDate = req.body.postFromDate;
        var toDate = req.body.postToDate;
        var fromTime = req.body.postFromTime;
        var toTime = req.body.postToTime;

        var resLatLong = loc.split("_");
        var latitude = resLatLong[0];
        var longitude = resLatLong[1];

        console.log(latitude + longitude);
        if (sch1 == '1'){
            fromDate = new Date();
            toDate = new Date();
            toDate.setDate(toDate.getDate() + 1);

           
            
            var fDate = fromDate.getFullYear() + "-" + fromDate.getMonth() + "-" + fromDate.getDate();
            var tDate = toDate.getFullYear() + "-" + toDate.getMonth() + "-" + toDate.getDate();
        }else if (sch1 == '2'){
            // For a specific Day
        }else if (sch1 == '3'){
            // Recurring
            var sch2 = req.body.Schedule2;
            switch(sch2){
                case '1':
                    var week = req.body.Week;
                    var currDate = new Date();
                    var day = currDate.getDay();
                    switch(week){
                        case "1":
                            
                            break;
                        case "2":
                            break;
                        case "3":
                            break;
                        case "4":
                            break;
                        case "5":
                            break;
                        case "6":
                            break;
                        case "7":
                            break;
                    }
                    break;
                case '2':
                    break;
                case '3':
                    break;
                case '4':
                    break;
                
            }
        }

        console.log(fDate + ":" + tDate);






        return res.send("Awesome");
    });


    
    return router;
};