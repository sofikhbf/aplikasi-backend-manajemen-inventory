let mysql = require("mysql");
mysql.createConnection({ multipleStatements: true });

let connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "api-inventory",
  port: "3305",
});

connection.connect(function (error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log("Connection Database Succuessfully!");
  }
});

module.exports = connection;
