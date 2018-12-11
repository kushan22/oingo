const express = require('express');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const routes = require('./routes');


app.set('view engine','ejs');
if (app.get('env') === 'development'){
    app.locals.pretty = true;
}
app.set('views',path.join(__dirname,'./views'));
const options = {
    host: "MSI",
    user : "master",
    password:"master",
    database: "sys",
    port: 3306,

};

var connection = mysql.createConnection(options);

if(!connection){
    console.log("ERROR");
}
// Setting Mysql Session
const sessionStore = new MySQLStore({},connection);

app.use(session({
    key:'oingo_cookie',
    secret:'Dogs are Love',
    store:sessionStore,
    resave: false,
    saveUninitialized:false,
}));
app.use(bodyParser.urlencoded({extended:true}));

app.use('/',routes());  
app.use(express.static('public'));
app.get('/favicon.ico',(req,res,next) => {
    return res.sendStatus(204);
});


app.listen(2295);

module.export = app;