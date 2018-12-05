const mysql = require('mysql');

    const con = mysql.createConnection({
        host: "localhost",
        user : "root",
        password: "Coldplay1",
        database: "oingo",
        port: 8889,

    });

con.connect((err)=>{
    if(err) console.log(err);
    console.log("Connected");
    
});

module.exports = con;