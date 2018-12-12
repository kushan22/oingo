const express = require('express');
const db = require('../config/database_conn');
const promiseDb = require('../config/promisedatabaseconn');



const router = express.Router();
var sess;
var USER_ID, USER_NAME;
module.exports = () => {



    router.get('/', (req, res, next) => {
        sess = req.session;
        if (!sess.sessId) {
            return res.render('registration', {
                page: 'Registration',
                flag: 0
            });


        } else {
            var userId = sess.sessId;
            console.log("Inside Route 1");
            var userFullName = "";
            var sql = "SELECT fullname from user where uid='" + userId + "'";
            db.query(sql, (err, result) => {
                if (result.length > 0) {
                    userFullName = result[0].fullname;
                    USER_ID = userId;
                    USER_NAME = userFullName;

                    res.redirect('/home');
                } else {
                    return next();
                }
            });

        }


    });

    router.post('/register', (req, res, next) => {
        console.log(req.body);
        const fullName = req.body.fullname.trim();
        const username = req.body.username.trim();
        const email = req.body.email.trim();
        const password = req.body.password.trim();
        const profilePic = "default";
        const state = "defaultState";

        if (!fullName || !username || !email || !password) {
            return res.render('registration', {
                page: 'Registration',
                flag: 1
            });
        }

        const sql = "INSERT INTO user (uname,email,profilepic,password,fullname,state) VALUES('" + username + "','" + email + "','" + profilePic + "','" + password + "','" + fullName + "','" + state + "')";
        db.query(sql, (err, result) => {
            if (err) {
                successfulRegistration = false;
                console.log(err);
                return res.render('registration', {
                    page: 'Registration',
                    flag: 2
                });

            } else {

                return res.render('registration', {
                    page: 'Registration',
                    flag: 3
                });
            }


        });

    });

    router.post('/login', (req, res, next) => {
        console.log(req.body);
        const userName = req.body.username.trim();
        const password = req.body.password.trim();


        db.query("SELECT * FROM user where uname='" + userName + "' and password='" + password + "'",
            (err, result) => {
                if (result.length == 0) {
                    res.render('registration', {
                        page: 'Registration',
                        flag: 4
                    })
                } else {


                    sess = req.session;
                    sess.sessId = result[0].uid;
                    USER_ID = result[0].uid;
                    USER_NAME = result[0].fullname;
                    res.redirect('/home');
                }



            });

        //return res.render('registration');


    });

    router.get('/home/friend', async (req, res, next) => {
        console.log("inside friend");
        console.log(req.query);
        var userid = req.query['uid'];
        var sessionUser = USER_ID;
        console.log(sessionUser);
        friendreqStatus = 1;
        try {
            var friend_reqsql = "INSERT INTO friends(u1id,u2id,status) values('" + sessionUser + "','" + userid + "','" + friendreqStatus + "')";
            var status = await promiseDb.query(friend_reqsql);
        } catch (err) {
            throw new Error(err);
        }
        res.redirect('/home');
    });

    router.post('/home/friendrequest', async (req, res, next) => {

        var user = USER_ID;
        acceptedreqid = req.body.friendId;
        console.log(acceptedreqid||"eyyy");
        console.log("in friend request");
        console.log(req.body);
        
        if (acceptedreqid) {
            friendstatus = 2;
            try {
                var updateQuery = "update friends set status='" + friendstatus + "' where u2id='" + USER_ID + "' and u1id='" + acceptedreqid + "'";
                console.log(updateQuery);
                var updateres = await promiseDb.query(updateQuery);

            } catch (err) {
                throw new Error(err);
            }
        }
        res.redirect('/home/friendrequest');

    });



    router.get('/home/friendrequest', async (req, res, next) => {
        var frflag

        frflag = 1;
        console.log("inside friend requests");
        var sessionUser = USER_ID;
        console.log(USER_ID);

        try {
            var friend_reqsql = "select uid,fullname from user where uid in (select u1id  from friends where status =1 and u2id='" + USER_ID + "')";
            var friendreqres = await promiseDb.query(friend_reqsql);
            var res_arr_friends = [];
            var res_arr_frname = [];
            for (var i = 0; i < friendreqres.length; i++) {
                res_arr_friends[i] = friendreqres[i]['uid'];
                res_arr_frname[i] = friendreqres[i]['fullname'];
            }
            console.log(res_arr_friends);
        } catch (err) {
            throw new Error(err);
        }




        return res.render('friendrequest', {
            friendflag: frflag,
            friends: res_arr_friends,
            frname: res_arr_frname,
        });

    });


    router.post('/logout', (req, res, next) => {
        req.session.destroy((err) => {
            if (err) {
                console.log("Error");
            } else {
                // return res.render('registration',{
                //     page:'Registration',
                //     flag:0
                // });
                console.log("Inside Logout");
                res.redirect('/');
            }
        });
    });

    router.get('/home/createPost', (req, res, next) => {
        console.log("Called Create Post");
        sess = req.session;
        var userid = sess.sessId;
        return res.render('createPost');
    });

    router.get('/home/filter', (req, res, next) => {
        sess = req.session;
        var userid = sess.sessId;
        return res.render('filter');
    });

    router.post('home/filter', (req, res, next) => {
        return res.send("Redirect to Create Post Page");
    });


    // Home Router
    router.get('/home', async (req, res, next) => {
        //req.connection.setTimeout(0);
        var num_of_posts = 1, num_of_friends = 1, num_of_filters = 1;
        console.log("Called");

        try {
            var sql = "SELECT Count(*) as postCount FROM posts where uid = '" + USER_ID + "'";
            var resultPost = await promiseDb.query(sql);
            num_of_posts = resultPost[0]['postCount'];

            var sql1 = "SELECT Count(*) as friendCount FROM friends where u1id = '" + USER_ID + "' OR u2id = '" + USER_ID + "'";
            var resultFriend = await promiseDb.query(sql1);
            num_of_friends = resultFriend[0]['friendCount'];

            var sql2 = "SELECT Count(*) as filterCount FROM filter_save where uid = '" + USER_ID + "'";
            var resultFilter = await promiseDb.query(sql2);
            num_of_filters = resultFilter[0]['filterCount'];
            console.log(USER_ID);
            var friendsql = "select uid,fullname from user where uid != '" + USER_ID + "' and uid  not in( select distinct u1id as friends from friends where u2id='" + USER_ID + "' and status in (1,2) union  select distinct u2id as friends from friends where u1id='" + USER_ID + "' and status in (1,2)) ";
            var friendsug = await promiseDb.query(friendsql);
            var countfriendsug = friendsug.length;
            var friendsug_res = [];
            var friendsug_resname = [];
            console.log(countfriendsug);
            for (var i = 0; i < countfriendsug; i++) {
                friendsug_res[i] = friendsug[i]['uid'];
                friendsug_resname[i] = friendsug[i]['fullname'];
            }

            return res.render('home', {
                page: 'Home Page',
                success: true,
                id: USER_ID,
                name: USER_NAME,
                posts: num_of_posts,
                friends: num_of_friends,
                filters: num_of_filters,
                friendsuggestion: friendsug_res,
                friendsuggestionname: friendsug_resname,
            });
        } catch (err) {
            throw new Error(err);
        }













    });

    router.post('/home/createPost',(req,res,next) => {
       // console.log(req.body);
        var fromDate,toDate,fromtime,toTime,scheduleId,locationId,postId;
        var postDesc = req.body.postDescription.trim();
        var postTags = req.body.postTags.trim();

        console.log(postTags);
        var state = req.body.state.trim();
        var loc = req.body.postLocation.trim();
        var radius = req.body.postRadius.trim();
        var sch1 = req.body.Schedule1;

        tags = postTags.match(/#[a-z]+/gi);
       
        var resLatLong = loc.split("_");
        var latitude = (resLatLong[0] * (Math.PI / 180)).toFixed(8);
        var longitude = (resLatLong[1] * (Math.PI / 180)).toFixed(8) ;

        console.log(latitude + ":" + longitude);
        


       console.log(latitude + longitude);
        if (sch1 == '1'){
            fromDate = new Date();
            toDate = new Date();
            toDate.setDate(toDate.getDate() + 1);

            var fDate = fromDate.getFullYear() + "-" + fromDate.getMonth() + "-" + fromDate.getDate();
            var tDate = toDate.getFullYear() + "-" + toDate.getMonth() + "-" + toDate.getDate();
            fromtime = fromDate.getHours() + ":" + fromDate.getMinutes() + ":" + fromDate.getSeconds();
            toTime = toDate.getHours() + ":" + toDate.getMinutes() + ":" + toDate.getSeconds();

            const sql = "INSERT INTO schedule (schflag) VALUES('1')";
            db.query(sql,(err,result)=>{
                
               if (err){
                  throw new Error(err);
               }else{
                 //  console.log(result['insertId']);
                   scheduleId = result['insertId'];
                   var applicableDate = fDate;
                   for (var i = 0; i < 2; i++){
                    const sql = "INSERT INTO scheduling_details (schid,from_date,to_date,from_time,to_time,applicable_date,skip_period) VALUES('"+result['insertId']+"','"+fDate+"','"+tDate+"','"+fromtime+"','"+toTime+"','"+applicableDate+"','0')";
                    db.query(sql,(err,result) => {
                        if (err){
                            throw new Error(err);
                        }else{
                            
                            console.log("Success");    
                        }
                    });
                    applicableDate = tDate;                 
                   }
                  
               }
    
            });

            const sqlLoc =  "INSERT INTO location (latitude,longitude,radius) VALUES('"+latitude+"','"+longitude+"','"+radius+"')";
            db.query(sqlLoc,(err,result) => {
                if (err){
                    throw new Error(err);
                }else{
                    locationId = result['insertId'];
                    console.log(locationId);

                    const userLocQuery = "INSERT INTO user_location (uid,lid) VALUES('"+USER_ID+"','"+locationId+"')";
                    db.query(userLocQuery,(err,result)=>{
                        if (err){
                            throw new Error(err);
                        }else{

                            const postSql = "INSERT INTO posts (description,state,lid,schid,uid,c_flag,access_flag) VALUES('"+postDesc+"','"+state+"','"+locationId+"','"+scheduleId+"','"+USER_ID+"','1','3')";
                            db.query(postSql,(err,result) => {
                                if (err){
                                    throw new Error(err);
                                }else{
                                    postId = result['insertId'];
                                    
                                    for (var i = 0; i < tags.length; i++){
                                        const tagSql = "INSERT INTO tag (tagname) VALUES('"+tags[i]+"')";
                                        db.query(tagSql,(err,result) => {
                                            if (err){
                                                throw new Error(err);
                                            }else{
                                                const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES('"+postId+"','"+result['insertId']+"')";
                                                db.query(postTagSql,(err,result) => {
                                                    if (err){
                                                        throw new Error(err);
                                                    }else{
                                                        console.log("Done");
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }

                            });
                            return res.redirect('/home');
                        }
                    });
                    
                }
            });
    
            
        }else if (sch1 == '2'){
            // For a specific Day
            fromDate = req.body.postFromDate;
           // toDate = req.body.postToDate;

            fromtime = req.body.postFromTime;
            toTime = req.body.postToTime;

            fromtime = fromtime.substring(0,fromtime.indexOf(" "));
            fromdigit = fromtime.substring(0,fromtime.indexOf(":"));
            if (fromdigit.length == 1){
                fromtime = "0" + fromtime;
            }
            toTime = toTime.substring(0,toTime.indexOf(" "));
            toDigit = toTime.substring(0,toTime.indexOf(":"));
            if (fromdigit.length == 1){
                toTime = "0" + toTime;
            }
            fromtime = fromtime + ":00";
            toTime = toTime + ":00";


            const sql = "INSERT INTO schedule (schflag) VALUES('2')";
            db.query(sql,(err,result)=>{
                if (err){
                    throw new Error(err);
                }else{
                    scheduleId = result['insertId'];
                    applicableDate = fromDate;
                    const innerSql = "INSERT INTO scheduling_details (schid,from_date,to_date,from_time,to_time,applicable_date,skip_period) VALUES('"+result['insertId']+"','"+fromDate+"','"+fromDate+"','"+fromtime+"','"+toTime+"','"+applicableDate+"','0')";
                    db.query(innerSql,(err,result)=>{
                        if (err){
                            throw new Error(err);
                        }else{
                            console.log("Sucess");
                        }
                    });
                }
            });

            const sqlLoc =  "INSERT INTO location (latitude,longitude,radius) VALUES('"+latitude+"','"+longitude+"','"+radius+"')";
            db.query(sqlLoc,(err,result) => {
                if (err){
                    throw new Error(err);
                }else{
                    locationId = result['insertId'];
                    console.log(locationId);

                    const userLocQuery = "INSERT INTO user_location (uid,lid) VALUES('"+USER_ID+"','"+locationId+"')";
                    db.query(userLocQuery,(err,result)=>{
                        if (err){
                            throw new Error(err);
                        }else{
                            const postSql = "INSERT INTO posts (description,state,lid,schid,uid,c_flag,access_flag) VALUES('"+postDesc+"','"+state+"','"+locationId+"','"+scheduleId+"','"+USER_ID+"','1','3')";
                            db.query(postSql,(err,result) => {
                                if (err){
                                    throw new Error(err);
                                }else{
                                    postId = result['insertId'];
                                    
                                    for (var i = 0; i < tags.length; i++){
                                        const tagSql = "INSERT INTO tag (tagname) VALUES('"+tags[i]+"')";
                                        db.query(tagSql,(err,result) => {
                                            if (err){
                                                throw new Error(err);
                                            }else{
                                                const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES('"+postId+"','"+result['insertId']+"')";
                                                db.query(postTagSql,(err,result) => {
                                                    if (err){
                                                        throw new Error(err);
                                                    }else{
                                                        console.log("Done");
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }

                            });
                            
                            return res.redirect('/home');
                        }
                    });
                }
            });
            
            //console.log("From Date: " + fromDate + " To Date:" + toDate);
        }else if (sch1 == '3'){
            // Recurring
            var sch2 = req.body.Schedule2;
            switch (sch2) {
                case '1':
                    var applicableDate;
                    var week = req.body.Week;
                    var currDate = new Date();
                    console.log(currDate);
                   // console.log("Current Date: " + currDate);
                    var day = currDate.getDay();
                   // console.log("CurrentDayofWeek " + day + " DayofWeekSelected " + week);
                    while (day != week){
                        day = (day + 1) % 7;
                        currDate.setDate(currDate.getDate() + 1);
                    }

                    console.log(currDate);

                    fromDate = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate();
                    toDate = req.body.postFromDate;

                    fromtime = req.body.postFromTime;
                    toTime = req.body.postToTime;

                    fromtime = fromtime.substring(0,fromtime.indexOf(" "));
                    fromdigit = fromtime.substring(0,fromtime.indexOf(":"));
                    if (fromdigit.length == 1){
                        fromtime = "0" + fromtime;
                    }
                    toTime = toTime.substring(0,toTime.indexOf(" "));
                    toDigit = toTime.substring(0,toTime.indexOf(":"));
                    if (fromdigit.length == 1){
                        toTime = "0" + toTime;
                    }
                    fromtime = fromtime + ":00";
                    toTime = toTime + ":00";

                    applicableDate = new Date();

                    
                    var toDateDummy = new Date(toDate);

                    const sql = "INSERT INTO schedule (schflag) VALUES('4')";
                    db.query(sql,(err,result) => {
                        if (err){
                            throw new Error(err);
                        }else{
                            scheduleId = result['insertId'];
                            while(applicableDate < toDateDummy){
                                
                                var appDate = applicableDate.getFullYear() + "-" + (applicableDate.getMonth() + 1) + "-" + applicableDate.getDate();
                                const innerSql = "INSERT INTO scheduling_details (schid,from_date,to_date,from_time,to_time,applicable_date,skip_period) VALUES('"+result['insertId']+"','"+fromDate+"','"+toDate+"','"+fromtime+"','"+toTime+"','"+appDate+"','7')";
                                db.query(innerSql,(err,result) => {
                                    if (err){
                                        throw new Error(err);
                                    }else{
                                        console.log("Sucess");
                                    }
                                });
                                applicableDate.setDate(applicableDate.getDate() + 7);
                                
                            }
                            
                        }
                    });
                
                    const sqlLoc1 =  "INSERT INTO location (latitude,longitude,radius) VALUES('"+latitude+"','"+longitude+"','"+radius+"')";
                    db.query(sqlLoc1,(err,result) => {
                        if (err){
                            throw new Error(err);
                        }else{
                            locationId = result['insertId'];
                            const userLocQuery = "INSERT INTO user_location (uid,lid) VALUES('"+USER_ID+"','"+locationId+"')";
                            db.query(userLocQuery,(err,result)=>{
                                if (err){
                                    throw new Error(err);
                                }else{
                                    const postSql = "INSERT INTO posts (description,state,lid,schid,uid,c_flag,access_flag) VALUES('"+postDesc+"','"+state+"','"+locationId+"','"+scheduleId+"','"+USER_ID+"','1','3')";
                            db.query(postSql,(err,result) => {
                                if (err){
                                    throw new Error(err);
                                }else{
                                    postId = result['insertId'];
                                    
                                    for (var i = 0; i < tags.length; i++){
                                        const tagSql = "INSERT INTO tag (tagname) VALUES('"+tags[i]+"')";
                                        db.query(tagSql,(err,result) => {
                                            if (err){
                                                throw new Error(err);
                                            }else{
                                                const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES('"+postId+"','"+result['insertId']+"')";
                                                db.query(postTagSql,(err,result) => {
                                                    if (err){
                                                        throw new Error(err);
                                                    }else{
                                                        console.log("Done");
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }

                            });
                                    return res.redirect('/home');
                                }
                            });
                        }
                    });

                    
                    
                    

                    
                    break;
                case '2':
                var applicableDate;
                var week = req.body.Week;
                var currDate = new Date();
                console.log(currDate);
               // console.log("Current Date: " + currDate);
                var day = currDate.getDay();
               // console.log("CurrentDayofWeek " + day + " DayofWeekSelected " + week);
                while (day != week){
                    day = (day + 1) % 7;
                    currDate.setDate(currDate.getDate() + 1);
                }

                console.log(currDate);

                fromDate = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate();
                toDate = req.body.postFromDate;

                fromtime = req.body.postFromTime;
                toTime = req.body.postToTime;

                fromtime = fromtime.substring(0,fromtime.indexOf(" "));
                fromdigit = fromtime.substring(0,fromtime.indexOf(":"));
                if (fromdigit.length == 1){
                    fromtime = "0" + fromtime;
                }
                toTime = toTime.substring(0,toTime.indexOf(" "));
                toDigit = toTime.substring(0,toTime.indexOf(":"));
                if (fromdigit.length == 1){
                    toTime = "0" + toTime;
                }
                fromtime = fromtime + ":00";
                toTime = toTime + ":00";

                applicableDate = new Date();

                
                var toDateDummy = new Date(toDate);

                const sql1 = "INSERT INTO schedule (schflag) VALUES('4')";
                db.query(sql1,(err,result) => {
                    if (err){
                        throw new Error(err);
                    }else{
                        scheduleId = result['insertId'];
                        while(applicableDate < toDateDummy){
                            
                            var appDate = applicableDate.getFullYear() + "-" + (applicableDate.getMonth() + 1) + "-" + applicableDate.getDate();
                            const innerSql = "INSERT INTO scheduling_details (schid,from_date,to_date,from_time,to_time,applicable_date,skip_period) VALUES('"+result['insertId']+"','"+fromDate+"','"+toDate+"','"+fromtime+"','"+toTime+"','"+appDate+"','14')";
                            db.query(innerSql,(err,result) => {
                                if (err){
                                    throw new Error(err);
                                }else{
                                    console.log("Sucess");
                                }
                            });
                            applicableDate.setDate(applicableDate.getDate() + 14);
                            
                        }
                       
                    }
                });

                const sqlLoc2 =  "INSERT INTO location (latitude,longitude,radius) VALUES('"+latitude+"','"+longitude+"','"+radius+"')";
                db.query(sqlLoc2,(err,result) => {
                    if (err){
                        throw new Error(err);
                    }else{
                        locationId = result['insertId'];
                        const userLocQuery1 = "INSERT INTO user_location (uid,lid) VALUES('"+USER_ID+"','"+locationId+"')";
                        db.query(userLocQuery1,(err,result)=>{
                        if (err){
                            throw new Error(err);
                        }else{
                            const postSql = "INSERT INTO posts (description,state,lid,schid,uid,c_flag,access_flag) VALUES('"+postDesc+"','"+state+"','"+locationId+"','"+scheduleId+"','"+USER_ID+"','1','3')";
                            db.query(postSql,(err,result) => {
                                if (err){
                                    throw new Error(err);
                                }else{
                                    postId = result['insertId'];
                                    
                                    for (var i = 0; i < tags.length; i++){
                                        const tagSql = "INSERT INTO tag (tagname) VALUES('"+tags[i]+"')";
                                        db.query(tagSql,(err,result) => {
                                            if (err){
                                                throw new Error(err);
                                            }else{
                                                const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES('"+postId+"','"+result['insertId']+"')";
                                                db.query(postTagSql,(err,result) => {
                                                    if (err){
                                                        throw new Error(err);
                                                    }else{
                                                        console.log("Done");
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }

                            });
                            return res.redirect('/home');
                        }
                    });
                    }
                });
                    
                    break;
                case '3':
                    fromDate = req.body.postFromDate;
                    toDate = req.body.postToDate;
                    fromtime = req.body.postFromTime;
                    toTime = req.body.postToTime;

                    

                    fromtime = fromtime.substring(0,fromtime.indexOf(" "));
                    fromdigit = fromtime.substring(0,fromtime.indexOf(":"));
                    if (fromdigit.length == 1){
                        fromtime = "0" + fromtime;
                    }
                    toTime = toTime.substring(0,toTime.indexOf(" "));
                    toDigit = toTime.substring(0,toTime.indexOf(":"));
                    if (fromdigit.length == 1){
                        toTime = "0" + toTime;
                    }
                    fromtime = fromtime + ":00";
                    toTime = toTime + ":00";

                    var dummyFromDate = new Date(fromDate);
                    var dummyTodate = new Date(toDate);
                    var applicableDate = dummyFromDate;
                 //   console.log(applicableDate);

                    const sql2 = "INSERT INTO schedule (schflag) VALUES('4')";
                    db.query(sql2,(err,result) => {
                        if (err){
                            throw new Error(err);
                        }else{
                            scheduleId = result['insertId'];
                            while (applicableDate <= dummyTodate){
                                var appDate = applicableDate.getFullYear() + "-" + (applicableDate.getMonth() + 1) + "-" + (applicableDate.getDate()+1);
                                console.log(appDate);
                                const innerSql = "INSERT INTO scheduling_details (schid,from_date,to_date,from_time,to_time,applicable_date,skip_period) VALUES('"+result['insertId']+"','"+fromDate+"','"+toDate+"','"+fromtime+"','"+toTime+"','"+appDate+"','30')";
                                db.query(innerSql,(err,result) => {
                                    if (err){
                                        throw new Error(err);
                                    }else{
                                        console.log("Sucess");
                                    }
                                });
                                if (applicableDate.getMonth() == 0 || applicableDate.getMonth() == 2 || applicableDate.getMonth() == 4 || applicableDate.getMonth() == 6 || applicableDate.getMonth() == 7 || applicableDate.getMonth() == 9 || applicableDate.getMonth() == 11){
                                    applicableDate.setDate(applicableDate.getDate() + 31);
                                }else if (applicableDate.getMonth() == 1) {
                                    if (applicableDate.getFullYear() % 4 == 0){
                                        applicableDate.setDate(applicableDate.getDate() + 29);
                                    }else{
                                        applicableDate.setDate(applicableDate.getDate() + 28);   
                                    }    
                                }else{
                                    applicableDate.setDate(applicableDate.getDate() + 30);
                                }
                               
                                
                            }
                          
                        }
                    });

                    const sqlLoc3 =  "INSERT INTO location (latitude,longitude,radius) VALUES('"+latitude+"','"+longitude+"','"+radius+"')";
                    db.query(sqlLoc3,(err,result) => {
                        if (err){
                            throw new Error(err);
                        }else{
                            locationId = result['insertId'];
                            const userLocQuery2 = "INSERT INTO user_location (uid,lid) VALUES('"+USER_ID+"','"+locationId+"')";
                            db.query(userLocQuery2,(err,result)=>{
                                if (err){
                                    throw new Error(err);
                                }else{
                                    const postSql = "INSERT INTO posts (description,state,lid,schid,uid,c_flag,access_flag) VALUES('"+postDesc+"','"+state+"','"+locationId+"','"+scheduleId+"','"+USER_ID+"','1','3')";
                            db.query(postSql,(err,result) => {
                                if (err){
                                    throw new Error(err);
                                }else{
                                    postId = result['insertId'];
                                    
                                    for (var i = 0; i < tags.length; i++){
                                        const tagSql = "INSERT INTO tag (tagname) VALUES('"+tags[i]+"')";
                                        db.query(tagSql,(err,result) => {
                                            if (err){
                                                throw new Error(err);
                                            }else{
                                                const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES('"+postId+"','"+result['insertId']+"')";
                                                db.query(postTagSql,(err,result) => {
                                                    if (err){
                                                        throw new Error(err);
                                                    }else{
                                                        console.log("Done");
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }

                            });
                                    return res.redirect('/home');
                                }
                            });
                        }
                    });

                    
                    

                

                    
                    break;
                    
                    
                case '4':
                    var currDate = new Date();
                    toDate = req.body.postFromDate;
                    fromtime = req.body.postFromTime;
                    toTime = req.body.postToTime;

                    fromtime = fromtime.substring(0,fromtime.indexOf(" "));
                    fromdigit = fromtime.substring(0,fromtime.indexOf(":"));
                    if (fromdigit.length == 1){
                        fromtime = "0" + fromtime;
                    }
                    toTime = toTime.substring(0,toTime.indexOf(" "));
                    toDigit = toTime.substring(0,toTime.indexOf(":"));
                    if (fromdigit.length == 1){
                        toTime = "0" + toTime;
                    }
                    fromtime = fromtime + ":00";
                    toTime = toTime + ":00";

                    fromDate = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate();

                    var dummyToDate = new Date(toDate);
                    var applicableDate = new Date(currDate);

                    
                    const sql4 = "INSERT INTO schedule (schflag) VALUES('3')";
                    db.query(sql4,(err,result)=>{
                        if (err){
                            throw new Error(err);
                        }else{
                            scheduleId = result['insertId'];
                            while (applicableDate <= dummyToDate){
                                var appDate = applicableDate.getFullYear() + "-" + (applicableDate.getMonth() + 1)  + "-" + applicableDate.getDate();
                                const innerSql = "INSERT INTO scheduling_details (schid,from_date,to_date,from_time,to_time,applicable_date,skip_period) VALUES('"+result['insertId']+"','"+fromDate+"','"+toDate+"','"+fromtime+"','"+toTime+"','"+appDate+"','0')";
                                db.query(innerSql,(err,result)=>{
                                    if (err){
                                        throw new Error(err);
                                    }else{
                                        console.log("Success");
                                    }
                                });

                                applicableDate.setDate(applicableDate.getDate() + 1);
                            }

                           
                        }
                    });

                   
                    const sqlLoc4 =  "INSERT INTO location (latitude,longitude,radius) VALUES('"+latitude+"','"+longitude+"','"+radius+"')";
                    db.query(sqlLoc4,(err,result) => {
                        if (err){
                            throw new Error(err);
                        }else{
                            locationId = result['insertId'];
                            const userLocQuery3 = "INSERT INTO user_location (uid,lid) VALUES('"+USER_ID+"','"+locationId+"')";
                            db.query(userLocQuery3,(err,result)=>{
                                if (err){
                                    throw new Error(err);
                                }else{
                                    const postSql = "INSERT INTO posts (description,state,lid,schid,uid,c_flag,access_flag) VALUES('"+postDesc+"','"+state+"','"+locationId+"','"+scheduleId+"','"+USER_ID+"','1','3')";
                            db.query(postSql,(err,result) => {
                                if (err){
                                    throw new Error(err);
                                }else{
                                    postId = result['insertId'];
                                    
                                    for (var i = 0; i < tags.length; i++){
                                        const tagSql = "INSERT INTO tag (tagname) VALUES('"+tags[i]+"')";
                                        db.query(tagSql,(err,result) => {
                                            if (err){
                                                throw new Error(err);
                                            }else{
                                                const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES('"+postId+"','"+result['insertId']+"')";
                                                db.query(postTagSql,(err,result) => {
                                                    if (err){
                                                        throw new Error(err);
                                                    }else{
                                                        console.log("Done");
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }

                            });
                                    return res.redirect('/home');
                                }
                            });
                        }
                    });

                    
                    break;

            }
        }

        

       






   // return res.redirect('/home');
     });



    return router;
};