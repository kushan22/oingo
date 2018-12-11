const mysql = require('mysql');
const util = require('util');


    
const pool = mysql.createPool({
        host: "localhost",
        user : "root",
        password: "Coldplay1",
        database: "oingo",
        port: 8889,

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