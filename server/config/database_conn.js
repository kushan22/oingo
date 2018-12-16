const mysql = require('mysql');

    const con = mysql.createConnection({
        host: "MSI",
        user : "master",
        password:"master",
        database: "sys",
        port: 3306,
        //insecureAuth: false
    });

con.connect((err)=>{
    if(err) console.log(err);
    else console.log("Connected");
    
});

module.exports = con;