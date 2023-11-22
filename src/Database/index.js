var mysql = require('mysql');
const properties = require('../../propertiesReader');


var database = properties.get('database');
var host = properties.get('host');
var user = properties.get('user');
var password = properties.get('password');
var port = properties.get('port');

var mysqlConnection = mysql.createConnection({
  host: host,
  port: port,
  user: user,
  password: password,
  database: database,
});

mysqlConnection.connect(function (err) {
  if (err) throw err;
  console.log("Connected DataBase!");
});

module.exports = mysqlConnection;