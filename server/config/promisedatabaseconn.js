const mysql = require('mysql');
const util = require('util');


    
const pool = mysql.createPool({
    host: "MSI",
    user : "master",
    password:"master",
    database: "sys",
    port: 3306,


    });

pool.getConnection((err,connection)=>{
    if (err){
        console.log("Error");
    }
    if (connection){
        connection.release();
    }

    return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;