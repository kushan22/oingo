const express = require('express');
const router = express.Router();
const db = require('../config/database_conn');

module.exports = () => {
    router.get('/',(req,res,next)=>{
        return res.render('registration',{
            page:'Registration',
            errorRegister:false,
            errorLogin:false,
            successfulRegistration: false
        });
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
                errorRegister: true
            });
        }

        const sql = "INSERT INTO user (uname,email,profilepic,password,fullname,state) VALUES('"+username+"','"+email+"','"+profilePic+"','"+password+"','"+fullName+"','"+state+"')";
        db.query(sql,(err,result)=>{
            if (err){
                successfulRegistration = false;
                throw err;
            } 
            console.log("1 Record Inserted");
            successfulRegistration = true;
        });

       

        return res.render('registration',{
            page: 'Registration',
            errorRegister: false,
            successfulRegistration
        });
    });

    router.post('/login',(req,res,next)=>{
        console.log(req.body);
        return res.render('registration');
    });

    return router;
};