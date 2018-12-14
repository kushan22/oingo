const express = require('express');
const db = require('../config/database_conn');
const promiseDb = require('../config/promisedatabaseconn');



const router = express.Router();
var sess;
var USER_ID, USER_NAME;
module.exports = () => {



    router.get('/', (req, res, next) => {
        console.log("Start of server");
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
            var sql = "SELECT fullname from user where uid=" + db.escape(userId) + "";
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
        console.log("Inside registration");
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

        const sql = "INSERT INTO user (uname,email,profilepic,password,fullname,state) VALUES(" + db.escape(username) + "," + db.escape(email) + "," + db.escape(profilePic) + "," + db.escape(password) + "," + db.escape(fullName) + "," + db.escape(state) + ")";
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
        console.log("end of registration");
    });

    router.post('/login', (req, res, next) => {
        console.log("Inside login");
        console.log(req.body);
        const userName = req.body.username.trim();
        const password = req.body.password.trim();


        db.query("SELECT * FROM user where uname=" + db.escape(userName) + " and password=" + db.escape(password) + "",
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
        console.log("end of login");

    });

    router.get('/home/friend', async (req, res, next) => {
        console.log("inside add friend from suggestion");
        console.log(req.query);
        var userid = req.query['uid'];
        var sessionUser = USER_ID;
        console.log(sessionUser);
        friendreqStatus = 1;
        try {
            var friend_reqsql = "INSERT INTO friends(u1id,u2id,status) values(" + db.escape(sessionUser) + "," + db.escape(userid) + "," + db.escape(friendreqStatus) + ")";
            var status = await promiseDb.query(friend_reqsql);
        } catch (err) {
            throw new Error(err);
        }
        console.log("end of add friend from suggestion");
        res.redirect('/home');
    });

    router.post('/home/friendrequest', async (req, res, next) => {
        console.log("inside post of add friend request");
        var user = USER_ID;
        acceptedreqid = req.body.friendId;
        console.log(acceptedreqid || "eyyy");
        console.log("in friend request");
        console.log(req.body);

        if (acceptedreqid) {
            friendstatus = 2;
            try {
                var updateQuery = "update friends set status=" + db.escape(friendstatus) + " where u2id=" + db.escape(USER_ID) + " and u1id=" + db.escape(acceptedreqid) + "";
                console.log(updateQuery);
                var updateres = await promiseDb.query(updateQuery);

            } catch (err) {
                throw new Error(err);
            }
        }
        console.log("end of post of add friend from requests");
        res.redirect('/home/friendrequest');

    });



    router.get('/home/friendrequest', async (req, res, next) => {
        var frflag

        frflag = 1;
        console.log("inside get of friend requests");
        var sessionUser = USER_ID;
        console.log(USER_ID);

        try {
            var friend_reqsql = "select uid,fullname from user where uid in (select u1id  from friends where status =1 and u2id=" + db.escape(USER_ID) + ")";
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
        console.log("inside logout");
        req.session.destroy((err) => {
            if (err) {
                console.log("Error");
            } else {
                // return res.render('registration',{
                //     page:'Registration',
                //     flag:0
                // });
                console.log("Completing Logout");
                res.redirect('/');
            }
        });
    });

    router.get('/home/createPost', async (req, res, next) => {
        console.log("Called Create Post-> get");
        var statesSql = "SELECT posts.state from posts UNION SELECT user.state from user where user.uid = " + db.escape(USER_ID) + "";
        var resultState = await promiseDb.query(statesSql);
        var allStates = [];
        for (var i = 0; i < resultState.length; i++) {
            allStates[i] = resultState[i]['state'];
        }
        console.log(allStates);
        // sess = req.session;
        return res.render('createPost', {
            states: allStates
        });
    });

    router.get('/home/filter', async (req, res, next) => {
        // sess = req.session;
        console.log("inside filter -> get");
        var statesSql = "SELECT posts.state from posts UNION SELECT user.state from user where user.uid = " + db.escape(USER_ID) + "";
        var resultState = await promiseDb.query(statesSql);
        var allStates = [];
        for (var i = 0; i < resultState.length; i++) {
            allStates[i] = resultState[i]['state'];
        }
        console.log(allStates);
        // sess = req.session;
        return res.render('filter', {
            states: allStates
        });
    });

    router.post('home/filter', (req, res, next) => {
        return res.send("Redirect to Create Post Page");
    });


    // Home Router
    router.get('/home', async (req, res, next) => {
        //req.connection.setTimeout(0);
        var num_of_posts = 1, num_of_friends = 1, num_of_filters = 1;
        // console.log("Called");

        try {
            var sql = "SELECT Count(*) as postCount FROM posts where uid = " + db.escape(USER_ID) + "";
            var resultPost = await promiseDb.query(sql);
            num_of_posts = resultPost[0]['postCount'];

            var sql1 = "SELECT Count(*) as friendCount FROM friends where u1id = " + db.escape(USER_ID) + " OR u2id = " + db.escape(USER_ID) + "";
            var resultFriend = await promiseDb.query(sql1);
            num_of_friends = resultFriend[0]['friendCount'];

            var sql2 = "SELECT Count(*) as filterCount FROM filter_save where uid = " + db.escape(USER_ID) + "";
            var resultFilter = await promiseDb.query(sql2);
            num_of_filters = resultFilter[0]['filterCount'];
            // console.log(USER_ID);
            var friendsql = "select uid,fullname from user where uid != " + db.escape(USER_ID) + " and uid  not in( select distinct u1id as friends from friends where u2id=" + db.escape(USER_ID) + " and status in (1,2) union  select distinct u2id as friends from friends where u1id=" + db.escape(USER_ID) + " and status in (1,2)) ";
            var friendsug = await promiseDb.query(friendsql);
            var countfriendsug = friendsug.length;
            var friendsug_res = [];
            var friendsug_resname = [];
            // console.log(countfriendsug);
            for (var i = 0; i < countfriendsug; i++) {
                friendsug_res[i] = friendsug[i]['uid'];
                friendsug_resname[i] = friendsug[i]['fullname'];
            }

            // Getting the posts

            var filterSql = "SELECT * from filter_save where uid = " + db.escape(USER_ID) + "";
            var filterRes = await promiseDb.query(filterSql);

            if (filterRes.length == 0) {
                var postSql = "SELECT pid,state,description from posts where uid = " + db.escape(USER_ID) + "";
                var postsResult = await promiseDb.query(postSql);

                var allPosts = [];
                for (var c = 0; c < postsResult.length; c++) {
                    allPosts.push({
                        state: postsResult[c]['state'],
                        description: postsResult[c]['description']
                    });
                }
            } else {
                var input_lat = filterRes[0]['flatitude'];
                var input_lon = filterRes[0]['flongitude'];
                var radius = filterRes[0]['radius'];



                var r = (radius / 6371).toFixed(8);

                var minLat = input_lat - r
                var maxLat = parseFloat(input_lat) + parseFloat(r)

                var deltaLon = (Math.asin(Math.sin(r) / Math.cos(input_lat))).toFixed(8);

                var minLon = input_lon - deltaLon;
                var maxLon = parseFloat(input_lon) + parseFloat(deltaLon);

                var sql = "select posts.pid,posts.state,posts.description from posts where posts.lid in (select location.lid from location ,filter_save where (location.latitude >=" + db.escape(minLat) + " and location.latitude <=" + db.escape(maxLat) + ") and (location.longitude >=" + db.escape(minLon) + " and location.longitude <=" + db.escape(maxLon) + ") and acos(sin(filter_save.flatitude) * sin(location.latitude) + cos(filter_save.flatitude) * cos(location.latitude) * cos(location.longitude -  filter_save.flongitude)) <=" + r + " and filter_save.uid=" + db.escape(USER_ID) + ") and posts.schid in (select scheduling_details.schid from scheduling_details ,filter_save where filter_save.filter_date = scheduling_details.applicable_date and filter_save.filter_from_time >= scheduling_details.from_time and filter_save.filter_to_time <= scheduling_details.to_time and filter_save.uid = " + db.escape(USER_ID) + ") and posts.pid in (select pt.pid from post_tag as pt where pt.tagid in (select t.tagid from tag as t,filter_save as fs where t.tagname = fs.tag and fs.uid=" + db.escape(USER_ID) + ")) and posts.state in (select filter_save.state from filter_save where filter_save.uid=" + db.escape(USER_ID) + ")";
                console.log(sql);

                var resultFiltererdPosts = await promiseDb.query(sql);
                var allPosts = [];
                for (var c = 0; c < resultFiltererdPosts.length; c++) {
                    allPosts.push({
                        state: resultFiltererdPosts[c]['state'],
                        description: resultFiltererdPosts[c]['description']
                    });
                }



            }



            //return next();



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
                totalPosts: allPosts
            });
        } catch (err) {
            throw new Error(err);
        }


    });

    router.get('/home/profile', async (req, res, next) => {

        try {
            var sql = "SELECT Count(*) as postCount FROM posts where uid = " + db.escape(USER_ID) + "";
            var resultPost = await promiseDb.query(sql);
            num_of_posts = resultPost[0]['postCount'];

            var sql1 = "SELECT Count(*) as friendCount FROM friends where u1id = " + db.escape(USER_ID) + " OR u2id = " + db.escape(USER_ID) + "";
            var resultFriend = await promiseDb.query(sql1);
            num_of_friends = resultFriend[0]['friendCount'];

            var sql2 = "SELECT Count(*) as filterCount FROM filter_save where uid = " + db.escape(USER_ID) + "";
            var resultFilter = await promiseDb.query(sql2);
            num_of_filters = resultFilter[0]['filterCount'];
            // console.log(USER_ID);
        } catch (err) {
            throw new Error(err);
        }



        return res.render('profile', {
            name: USER_NAME,
            id: USER_ID,
            friendCount: num_of_friends,
            filterCount: num_of_filters,
            postCount: num_of_posts,
        });
    });

    router.post('/home/profile', async (req, res, next) => {
        var userid = USER_ID;
        console.log("In post of profile");
        var state = req.body.State.trim();
        try {
            var friendsql = "update user set state= " + db.escape(state) + " where uid=" + db.escape(userid) + "";
            var stateupdate = await promiseDb.query(friendsql);
        } catch (err) {
            throw new Error(err);
        }
        return res.redirect('/home');
    });



    router.post('/home/createPost', async (req, res, next) => {
        // console.log(req.body);
        var fromDate, toDate, fromtime, toTime, scheduleId, locationId, postId;
        var postDesc = req.body.postDescription.trim();
        var postTags = req.body.postTags.trim();

        // console.log(postTags);
        var state = req.body.state.trim();
        var loc = req.body.hidlocname.trim();
        console.log("Loc " + loc);
        var radius = req.body.postRadius.trim();
        var sch1 = req.body.Schedule1;

        tags = postTags.match(/#[a-z]+/gi);

        var resLatLong = loc.split("_");
        var latitude = (resLatLong[0] * (Math.PI / 180)).toFixed(8);
        var longitude = (resLatLong[1] * (Math.PI / 180)).toFixed(8);

        // console.log(latitude + ":" + longitude);



        console.log(latitude + longitude);
        if (sch1 == '1') {
            fromDate = new Date();
            toDate = new Date();
            toDate.setDate(toDate.getDate() + 1);

            var fDate = fromDate.getFullYear() + "-" + fromDate.getMonth() + "-" + fromDate.getDate();
            var tDate = toDate.getFullYear() + "-" + toDate.getMonth() + "-" + toDate.getDate();
            fromtime = fromDate.getHours() + ":" + fromDate.getMinutes() + ":" + fromDate.getSeconds();
            toTime = toDate.getHours() + ":" + toDate.getMinutes() + ":" + toDate.getSeconds();

            const sql = "INSERT INTO schedule (schflag) VALUES('1')";
            db.query(sql, (err, result) => {

                if (err) {
                    throw new Error(err);
                } else {
                    //  console.log(result['insertId']);
                    scheduleId = result['insertId'];
                    var applicableDate = fDate;
                    for (var i = 0; i < 2; i++) {
                        const sql = "INSERT INTO scheduling_details (schid,from_date,to_date,from_time,to_time,applicable_date,skip_period) VALUES(" + db.escape(result['insertId']) + "," + db.escape(fDate) + "," + db.escape(tDate) + "," + db.escape(fromtime) + "," + db.escape(toTime) + "," + db.escape(applicableDate) + ",'0')";
                        db.query(sql, (err, result) => {
                            if (err) {
                                throw new Error(err);
                            } else {

                                console.log("Success");
                            }
                        });
                        applicableDate = tDate;
                    }

                }

            });

            const sqlLoc = "INSERT INTO location (latitude,longitude,radius) VALUES(" + db.escape(latitude) + "," + db.escape(longitude) + "," + db.escape(radius) + ")";
            db.query(sqlLoc, (err, result) => {
                if (err) {
                    throw new Error(err);
                } else {
                    locationId = result['insertId'];
                    console.log(locationId);

                    const userLocQuery = "INSERT INTO user_location (uid,lid) VALUES(" + db.escape(USER_ID) + "," + db.escape(locationId) + ")";
                    db.query(userLocQuery, (err, result) => {
                        if (err) {
                            throw new Error(err);
                        } else {

                            const postSql = "INSERT INTO posts (description,state,lid,schid,uid,c_flag,access_flag) VALUES(" + db.escape(postDesc) + "," + db.escape(state) + "," + db.escape(locationId) + "," + db.escape(scheduleId) + "," + db.escape(USER_ID) + ",'1','3')";
                            db.query(postSql, async (err, result) => {
                                if (err) {
                                    throw new Error(err);
                                } else {
                                    postId = result['insertId'];

                                    for (var i = 0; i < tags.length; i++) {
                                        // console.log(tags);
                                        const checkTagSql = "SELECT tagid,tagname from tag where tagname=" + db.escape(tags[i]) + "";
                                        var result = await promiseDb.query(checkTagSql);


                                        if (result.length == 0) {
                                            //console.log(tags[i]);
                                            const tagSql = "INSERT INTO tag (tagname) VALUES(" + db.escape(tags[i]) + ")";
                                            db.query(tagSql, (err, result) => {
                                                if (err) {
                                                    throw new Error(err);
                                                } else {
                                                    const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES(" + db.escape(postId) + "," + db.escape(result['insertId']) + ")";
                                                    db.query(postTagSql, (err, result) => {
                                                        if (err) {
                                                            throw new Error(err);
                                                        } else {
                                                            console.log("Done");
                                                        }
                                                    });
                                                }
                                            });
                                        } else {
                                            const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES(" + db.escape(postId) + "," + db.escape(result[0]['tagid']) + ")";
                                            db.query(postTagSql, (err, result) => {
                                                if (err) {
                                                    throw new Error(err);
                                                } else {
                                                    console.log("Done");
                                                }
                                            });
                                        }


                                    }
                                }

                            });
                            return res.redirect('/home');
                        }
                    });

                }
            });


        } else if (sch1 == '2') {
            // For a specific Day
            fromDate = req.body.postFromDate;
            // toDate = req.body.postToDate;

            fromtime = req.body.postFromTime;
            toTime = req.body.postToTime;

            fromtime = fromtime.substring(0, fromtime.indexOf(" "));
            fromdigit = fromtime.substring(0, fromtime.indexOf(":"));
            if (fromdigit.length == 1) {
                fromtime = "0" + fromtime;
            }
            toTime = toTime.substring(0, toTime.indexOf(" "));
            toDigit = toTime.substring(0, toTime.indexOf(":"));
            if (fromdigit.length == 1) {
                toTime = "0" + toTime;
            }
            fromtime = fromtime + ":00";
            toTime = toTime + ":00";


            const sql = "INSERT INTO schedule (schflag) VALUES('2')";
            db.query(sql, (err, result) => {
                if (err) {
                    throw new Error(err);
                } else {
                    scheduleId = result['insertId'];
                    applicableDate = fromDate;
                    const innerSql = "INSERT INTO scheduling_details (schid,from_date,to_date,from_time,to_time,applicable_date,skip_period) VALUES(" + db.escape(result['insertId']) + "," + db.escape(fromDate) + "," + db.escape(fromDate) + "," + db.escape(fromtime) + "," + db.escape(toTime) + "," + db.escape(applicableDate) + ",'0')";
                    db.query(innerSql, (err, result) => {
                        if (err) {
                            throw new Error(err);
                        } else {
                            console.log("Sucess");
                        }
                    });
                }
            });

            const sqlLoc = "INSERT INTO location (latitude,longitude,radius) VALUES(" + db.escape(latitude) + "," + longitude + "," + radius + ")";
            db.query(sqlLoc, (err, result) => {
                if (err) {
                    throw new Error(err);
                } else {
                    locationId = result['insertId'];
                    console.log(locationId);

                    const userLocQuery = "INSERT INTO user_location (uid,lid) VALUES(" + db.escape(USER_ID) + "," + db.escape(locationId) + ")";
                    db.query(userLocQuery, (err, result) => {
                        if (err) {
                            throw new Error(err);
                        } else {
                            const postSql = "INSERT INTO posts (description,state,lid,schid,uid,c_flag,access_flag) VALUES(" + db.escape(postDesc) + "," + db.escape(state) + "," + db.escape(locationId) + "," + scheduleId + "," + USER_ID + ",'1','3')";
                            db.query(postSql, async (err, result) => {
                                if (err) {
                                    throw new Error(err);
                                } else {
                                    postId = result['insertId'];

                                    for (var i = 0; i < tags.length; i++) {
                                        const checkTagSql = "SELECT tagid,tagname from tag where tagname=" + db.escape(tags[i]) + "";
                                        var result = await promiseDb.query(checkTagSql);


                                        if (result.length == 0) {
                                            //console.log(tags[i]);
                                            const tagSql = "INSERT INTO tag (tagname) VALUES(" + db.escape(tags[i]) + ")";
                                            db.query(tagSql, (err, result) => {
                                                if (err) {
                                                    throw new Error(err);
                                                } else {
                                                    const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES(" + db.escape(postId) + "," + db.escape(result['insertId']) + ")";
                                                    db.query(postTagSql, (err, result) => {
                                                        if (err) {
                                                            throw new Error(err);
                                                        } else {
                                                            console.log("Done");
                                                        }
                                                    });
                                                }
                                            });
                                        } else {
                                            const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES(" + db.escape(postId) + "," + db.escape(result[0]['tagid']) + ")";
                                            db.query(postTagSql, (err, result) => {
                                                if (err) {
                                                    throw new Error(err);
                                                } else {
                                                    console.log("Done");
                                                }
                                            });
                                        }

                                    }
                                }

                            });

                            return res.redirect('/home');
                        }
                    });
                }
            });

            //console.log("From Date: " + fromDate + " To Date:" + toDate);
        } else if (sch1 == '3') {
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
                    while (day != week) {
                        day = (day + 1) % 7;
                        currDate.setDate(currDate.getDate() + 1);
                    }

                    console.log(currDate);

                    fromDate = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate();
                    toDate = req.body.postFromDate;

                    fromtime = req.body.postFromTime;
                    toTime = req.body.postToTime;

                    fromtime = fromtime.substring(0, fromtime.indexOf(" "));
                    fromdigit = fromtime.substring(0, fromtime.indexOf(":"));
                    if (fromdigit.length == 1) {
                        fromtime = "0" + fromtime;
                    }
                    toTime = toTime.substring(0, toTime.indexOf(" "));
                    toDigit = toTime.substring(0, toTime.indexOf(":"));
                    if (fromdigit.length == 1) {
                        toTime = "0" + toTime;
                    }
                    fromtime = fromtime + ":00";
                    toTime = toTime + ":00";

                    applicableDate = new Date();


                    var toDateDummy = new Date(toDate);

                    const sql = "INSERT INTO schedule (schflag) VALUES('4')";
                    db.query(sql, (err, result) => {
                        if (err) {
                            throw new Error(err);
                        } else {
                            scheduleId = result['insertId'];
                            while (applicableDate < toDateDummy) {

                                var appDate = applicableDate.getFullYear() + "-" + (applicableDate.getMonth() + 1) + "-" + applicableDate.getDate();
                                const innerSql = "INSERT INTO scheduling_details (schid,from_date,to_date,from_time,to_time,applicable_date,skip_period) VALUES(" + db.escape(result['insertId']) + "," + db.escape(fromDate) + "," + db.escape(toDate) + "," + db.escape(fromtime) + "," + db.escape(toTime) + "," + db.escape(appDate) + ",'7')";
                                db.query(innerSql, (err, result) => {
                                    if (err) {
                                        throw new Error(err);
                                    } else {
                                        console.log("Sucess");
                                    }
                                });
                                applicableDate.setDate(applicableDate.getDate() + 7);

                            }

                        }
                    });

                    const sqlLoc1 = "INSERT INTO location (latitude,longitude,radius) VALUES(" + db.escape(latitude) + "," + db.escape(longitude) + "," + radius + ")";
                    db.query(sqlLoc1, (err, result) => {
                        if (err) {
                            throw new Error(err);
                        } else {
                            locationId = result['insertId'];
                            const userLocQuery = "INSERT INTO user_location (uid,lid) VALUES(" + db.escape(USER_ID) + "," + db.escape(locationId) + ")";
                            db.query(userLocQuery, (err, result) => {
                                if (err) {
                                    throw new Error(err);
                                } else {
                                    const postSql = "INSERT INTO posts (description,state,lid,schid,uid,c_flag,access_flag) VALUES(" + db.escape(postDesc) + "," + db.escape(state) + "," + db.escape(locationId) + "," + db.escape(scheduleId) + "," + db.escape(USER_ID) + ",'1','3')";
                                    db.query(postSql, async (err, result) => {
                                        if (err) {
                                            throw new Error(err);
                                        } else {
                                            postId = result['insertId'];

                                            for (var i = 0; i < tags.length; i++) {
                                                const checkTagSql = "SELECT tagid,tagname from tag where tagname=" + db.escape(tags[i]) + "";
                                                var result = await promiseDb.query(checkTagSql);


                                                if (result.length == 0) {
                                                    //console.log(tags[i]);
                                                    const tagSql = "INSERT INTO tag (tagname) VALUES(" + db.escape(tags[i]) + ")";
                                                    db.query(tagSql, (err, result) => {
                                                        if (err) {
                                                            throw new Error(err);
                                                        } else {
                                                            const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES(" + db.escape(postId) + "," + db.escape(result['insertId']) + ")";
                                                            db.query(postTagSql, (err, result) => {
                                                                if (err) {
                                                                    throw new Error(err);
                                                                } else {
                                                                    console.log("Done");
                                                                }
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES(" + db.escape(postId) + "," + db.escape(result[0]['tagid']) + ")";
                                                    db.query(postTagSql, (err, result) => {
                                                        if (err) {
                                                            throw new Error(err);
                                                        } else {
                                                            console.log("Done");
                                                        }
                                                    });
                                                }
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
                    while (day != week) {
                        day = (day + 1) % 7;
                        currDate.setDate(currDate.getDate() + 1);
                    }

                    console.log(currDate);

                    fromDate = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate();
                    toDate = req.body.postFromDate;

                    fromtime = req.body.postFromTime;
                    toTime = req.body.postToTime;

                    fromtime = fromtime.substring(0, fromtime.indexOf(" "));
                    fromdigit = fromtime.substring(0, fromtime.indexOf(":"));
                    if (fromdigit.length == 1) {
                        fromtime = "0" + fromtime;
                    }
                    toTime = toTime.substring(0, toTime.indexOf(" "));
                    toDigit = toTime.substring(0, toTime.indexOf(":"));
                    if (fromdigit.length == 1) {
                        toTime = "0" + toTime;
                    }
                    fromtime = fromtime + ":00";
                    toTime = toTime + ":00";

                    applicableDate = new Date();


                    var toDateDummy = new Date(toDate);

                    const sql1 = "INSERT INTO schedule (schflag) VALUES('4')";
                    db.query(sql1, (err, result) => {
                        if (err) {
                            throw new Error(err);
                        } else {
                            scheduleId = result['insertId'];
                            while (applicableDate < toDateDummy) {

                                var appDate = applicableDate.getFullYear() + "-" + (applicableDate.getMonth() + 1) + "-" + applicableDate.getDate();
                                const innerSql = "INSERT INTO scheduling_details (schid,from_date,to_date,from_time,to_time,applicable_date,skip_period) VALUES(" + db.escape(result['insertId']) + "," + db.escape(fromDate) + "," + db.escape(toDate) + "," + db.escape(fromtime) + "," + db.escape(toTime) + "," + appDate + ",'14')";
                                db.query(innerSql, (err, result) => {
                                    if (err) {
                                        throw new Error(err);
                                    } else {
                                        console.log("Success");
                                    }
                                });
                                applicableDate.setDate(applicableDate.getDate() + 14);

                            }

                        }
                    });

                    const sqlLoc2 = "INSERT INTO location (latitude,longitude,radius) VALUES(" + db.escape(latitude) + "," + db.escape(longitude) + "," + db.escape(radius) + ")";
                    db.query(sqlLoc2, (err, result) => {
                        if (err) {
                            throw new Error(err);
                        } else {
                            locationId = result['insertId'];
                            const userLocQuery1 = "INSERT INTO user_location (uid,lid) VALUES(" + db.escape(USER_ID) + "," + db.escape(locationId) + ")";
                            db.query(userLocQuery1, (err, result) => {
                                if (err) {
                                    throw new Error(err);
                                } else {
                                    const postSql = "INSERT INTO posts (description,state,lid,schid,uid,c_flag,access_flag) VALUES(" + db.escape(postDesc) + "," + db.escape(state) + "," + db.escape(locationId) + "," + db.escape(scheduleId) + "," + db.escape(USER_ID) + ",'1','3')";
                                    db.query(postSql, async (err, result) => {
                                        if (err) {
                                            throw new Error(err);
                                        } else {
                                            postId = result['insertId'];

                                            for (var i = 0; i < tags.length; i++) {
                                                const checkTagSql = "SELECT tagid,tagname from tag where tagname=" + db.escape(tags[i]) + "";
                                                var result = await promiseDb.query(checkTagSql);


                                                if (result.length == 0) {
                                                    //console.log(tags[i]);
                                                    const tagSql = "INSERT INTO tag (tagname) VALUES(" + db.escape(tags[i]) + ")";
                                                    db.query(tagSql, (err, result) => {
                                                        if (err) {
                                                            throw new Error(err);
                                                        } else {
                                                            const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES(" + db.escape(postId) + "," + db.escape(result['insertId']) + ")";
                                                            db.query(postTagSql, (err, result) => {
                                                                if (err) {
                                                                    throw new Error(err);
                                                                } else {
                                                                    console.log("Done");
                                                                }
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES(" + db.escape(postId) + "," + db.escape(result[0]['tagid']) + ")";
                                                    db.query(postTagSql, (err, result) => {
                                                        if (err) {
                                                            throw new Error(err);
                                                        } else {
                                                            console.log("Done");
                                                        }
                                                    });
                                                }
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



                    fromtime = fromtime.substring(0, fromtime.indexOf(" "));
                    fromdigit = fromtime.substring(0, fromtime.indexOf(":"));
                    if (fromdigit.length == 1) {
                        fromtime = "0" + fromtime;
                    }
                    toTime = toTime.substring(0, toTime.indexOf(" "));
                    toDigit = toTime.substring(0, toTime.indexOf(":"));
                    if (fromdigit.length == 1) {
                        toTime = "0" + toTime;
                    }
                    fromtime = fromtime + ":00";
                    toTime = toTime + ":00";

                    var dummyFromDate = new Date(fromDate);
                    var dummyTodate = new Date(toDate);
                    var applicableDate = dummyFromDate;
                    //   console.log(applicableDate);

                    const sql2 = "INSERT INTO schedule (schflag) VALUES('4')";
                    db.query(sql2, (err, result) => {
                        if (err) {
                            throw new Error(err);
                        } else {
                            scheduleId = result['insertId'];
                            while (applicableDate <= dummyTodate) {
                                var appDate = applicableDate.getFullYear() + "-" + (applicableDate.getMonth() + 1) + "-" + (applicableDate.getDate() + 1);
                                console.log(appDate);
                                const innerSql = "INSERT INTO scheduling_details (schid,from_date,to_date,from_time,to_time,applicable_date,skip_period) VALUES(" + db.escape(result['insertId']) + "," + db.escape(fromDate) + "," + db.escape(toDate) + "," + db.escape(fromtime) + "," + db.escape(toTime) + "," + db.escape(appDate) + ",'30')";
                                db.query(innerSql, (err, result) => {
                                    if (err) {
                                        throw new Error(err);
                                    } else {
                                        console.log("Sucess");
                                    }
                                });
                                if (applicableDate.getMonth() == 0 || applicableDate.getMonth() == 2 || applicableDate.getMonth() == 4 || applicableDate.getMonth() == 6 || applicableDate.getMonth() == 7 || applicableDate.getMonth() == 9 || applicableDate.getMonth() == 11) {
                                    applicableDate.setDate(applicableDate.getDate() + 31);
                                } else if (applicableDate.getMonth() == 1) {
                                    if (applicableDate.getFullYear() % 4 == 0) {
                                        applicableDate.setDate(applicableDate.getDate() + 29);
                                    } else {
                                        applicableDate.setDate(applicableDate.getDate() + 28);
                                    }
                                } else {
                                    applicableDate.setDate(applicableDate.getDate() + 30);
                                }


                            }

                        }
                    });

                    const sqlLoc3 = "INSERT INTO location (latitude,longitude,radius) VALUES(" + db.escape(latitude) + "," + db.escape(longitude) + "," + db.escape(radius) + ")";
                    db.query(sqlLoc3, (err, result) => {
                        if (err) {
                            throw new Error(err);
                        } else {
                            locationId = result['insertId'];
                            const userLocQuery2 = "INSERT INTO user_location (uid,lid) VALUES(" + db.escape(USER_ID) + "," + db.escape(locationId) + ")";
                            db.query(userLocQuery2, (err, result) => {
                                if (err) {
                                    throw new Error(err);
                                } else {
                                    const postSql = "INSERT INTO posts (description,state,lid,schid,uid,c_flag,access_flag) VALUES(" + db.escape(postDesc) + "," + db.escape(state) + "," + db.escape(locationId) + "," + db.escape(scheduleId) + "," + db.escape(USER_ID) + ",'1','3')";
                                    db.query(postSql, async (err, result) => {
                                        if (err) {
                                            throw new Error(err);
                                        } else {
                                            postId = result['insertId'];

                                            for (var i = 0; i < tags.length; i++) {
                                                const checkTagSql = "SELECT tagid,tagname from tag where tagname=" + db.escape(tags[i]) + "";
                                                var result = await promiseDb.query(checkTagSql);


                                                if (result.length == 0) {
                                                    //console.log(tags[i]);
                                                    const tagSql = "INSERT INTO tag (tagname) VALUES(" + db.escape(tags[i]) + ")";
                                                    db.query(tagSql, (err, result) => {
                                                        if (err) {
                                                            throw new Error(err);
                                                        } else {
                                                            const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES(" + db.escape(postId) + "," + db.escape(result['insertId']) + ")";
                                                            db.query(postTagSql, (err, result) => {
                                                                if (err) {
                                                                    throw new Error(err);
                                                                } else {
                                                                    console.log("Done");
                                                                }
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES(" + db.escape(postId) + "," + db.escape(result[0]['tagid']) + ")";
                                                    db.query(postTagSql, (err, result) => {
                                                        if (err) {
                                                            throw new Error(err);
                                                        } else {
                                                            console.log("Done");
                                                        }
                                                    });
                                                }
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

                    fromtime = fromtime.substring(0, fromtime.indexOf(" "));
                    fromdigit = fromtime.substring(0, fromtime.indexOf(":"));
                    if (fromdigit.length == 1) {
                        fromtime = "0" + fromtime;
                    }
                    toTime = toTime.substring(0, toTime.indexOf(" "));
                    toDigit = toTime.substring(0, toTime.indexOf(":"));
                    if (fromdigit.length == 1) {
                        toTime = "0" + toTime;
                    }
                    fromtime = fromtime + ":00";
                    toTime = toTime + ":00";

                    fromDate = currDate.getFullYear() + "-" + (currDate.getMonth() + 1) + "-" + currDate.getDate();

                    var dummyToDate = new Date(toDate);
                    var applicableDate = new Date(currDate);


                    const sql4 = "INSERT INTO schedule (schflag) VALUES('3')";
                    db.query(sql4, (err, result) => {
                        if (err) {
                            throw new Error(err);
                        } else {
                            scheduleId = result['insertId'];
                            while (applicableDate <= dummyToDate) {
                                var appDate = applicableDate.getFullYear() + "-" + (applicableDate.getMonth() + 1) + "-" + applicableDate.getDate();
                                const innerSql = "INSERT INTO scheduling_details (schid,from_date,to_date,from_time,to_time,applicable_date,skip_period) VALUES(" + db.escape(result['insertId']) + "," + db.escape(fromDate) + "," + db.escape(toDate) + "," + db.escape(fromtime) + "," + db.escape(toTime) + "," + db.escape(appDate) + ",'0')";
                                db.query(innerSql, (err, result) => {
                                    if (err) {
                                        throw new Error(err);
                                    } else {
                                        console.log("Success");
                                    }
                                });

                                applicableDate.setDate(applicableDate.getDate() + 1);
                            }


                        }
                    });


                    const sqlLoc4 = "INSERT INTO location (latitude,longitude,radius) VALUES(" + db.escape(latitude) + "," + db.escape(longitude) + "," + db.escape(radius) + ")";
                    db.query(sqlLoc4, (err, result) => {
                        if (err) {
                            throw new Error(err);
                        } else {
                            locationId = result['insertId'];
                            const userLocQuery3 = "INSERT INTO user_location (uid,lid) VALUES(" + db.escape(USER_ID) + "," + db.escape(locationId) + ")";
                            db.query(userLocQuery3, (err, result) => {
                                if (err) {
                                    throw new Error(err);
                                } else {
                                    const postSql = "INSERT INTO posts (description,state,lid,schid,uid,c_flag,access_flag) VALUES(" + db.escape(postDesc) + "," + db.escape(state) + "," + db.escape(locationId) + "," + db.escape(scheduleId) + "," + db.escape(USER_ID) + ",'1','3')";
                                    db.query(postSql, async (err, result) => {
                                        if (err) {
                                            throw new Error(err);
                                        } else {
                                            postId = result['insertId'];

                                            for (var i = 0; i < tags.length; i++) {
                                                const checkTagSql = "SELECT tagid,tagname from tag where tagname=" + db.escape(tags[i]) + "";
                                                var result = await promiseDb.query(checkTagSql);


                                                if (result.length == 0) {
                                                    //console.log(tags[i]);
                                                    const tagSql = "INSERT INTO tag (tagname) VALUES(" + db.escape(tags[i]) + ")";
                                                    db.query(tagSql, (err, result) => {
                                                        if (err) {
                                                            throw new Error(err);
                                                        } else {
                                                            const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES(" + db.escape(postId) + "," + db.escape(result['insertId']) + ")";
                                                            db.query(postTagSql, (err, result) => {
                                                                if (err) {
                                                                    throw new Error(err);
                                                                } else {
                                                                    console.log("Done");
                                                                }
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    const postTagSql = "INSERT INTO post_tag (pid,tagid) VALUES(" + db.escape(postId) + "," + db.escape(result[0]['tagid']) + ")";
                                                    db.query(postTagSql, (err, result) => {
                                                        if (err) {
                                                            throw new Error(err);
                                                        } else {
                                                            console.log("Done");
                                                        }
                                                    });
                                                }
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
        //kushaan to implement rest of it
       /*  else {

        } */

    });

    router.post('/home/filter', (req, res, next) => {
        var filterTag = req.body.filtertag;
        var state = req.body.filterState;
        var locationString = req.body.filterLocation;
        var radius = req.body.filterRadius;
        var filterDate = req.body.filterDate;
        var filterFromTime = req.body.filterFromTime;
        var filterToTime = req.body.filterToTime;

        filterFromTime = filterFromTime.substring(0, filterFromTime.indexOf(" "));
        fromdigit = filterFromTime.substring(0, filterFromTime.indexOf(":"));
        if (fromdigit.length == 1) {
            filterFromTime = "0" + filterFromTime;
        }
        filterToTime = filterToTime.substring(0, filterToTime.indexOf(" "));
        toDigit = filterToTime.substring(0, filterToTime.indexOf(":"));
        if (fromdigit.length == 1) {
            filterToTime = "0" + filterToTime;
        }
        filterFromTime = filterFromTime + ":00";
        filterToTime = filterToTime + ":00";

        var resLatLong = locationString.split("_");
        var latitude = (resLatLong[0] * (Math.PI / 180)).toFixed(8);
        var longitude = (resLatLong[1] * (Math.PI / 180)).toFixed(8);

        //console.log(filterTag);
        const filterSql = "INSERT INTO filter_save (uid,filter_date,filter_from_time,filter_to_time,state,tag,flatitude,flongitude,radius) VALUES(" + db.escape(USER_ID) + "," + db.escape(filterDate) + "," + db.escape(filterFromTime) + "," + db.escape(filterToTime) + "," + db.escape(state) + "," + db.escape(filterTag) + "," + db.escape(latitude) + "," + db.escape(longitude) + "," + radius + ")";
        db.query(filterSql, (err, result) => {
            if (err) {
                throw new Error(err);
            } else {
                console.log(result['insertId']);
                return res.redirect('/home/filter');
            }

        });
        //console.log("Tag: " + filterTag + " State " + state + " location " + locationString + " radius " + radius + " filterDate " + filterDate + " fromTime " + filterFromTime + " toTime " + filterToTime);


    });



    return router;
};