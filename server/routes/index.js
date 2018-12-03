const express = require('express');
const router = express.Router();

module.exports = () => {
    router.get('/',(req,res,next)=>{
        return res.render('registration');
    });

    router.post('/',(req,res,next) =>{
        return res.send("Post Request Sent");
    });

    return router;
};