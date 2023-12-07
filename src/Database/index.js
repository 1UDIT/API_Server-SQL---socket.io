var mysql = require('mysql');
const properties = require('../../propertiesReader');


var database = properties.get('database');
var host = properties.get('host');
var user = properties.get('user');
var password = properties.get('password');
var port = properties.get('port');

var mysqlConnection = mysql.createPool({
  connectionLimit : 20,
  host: host,
  port: port,
  user: user,
  password: password,
  database: database,
  timezone: 'utc',
  acquireTimeout:1000,
  connectTimeout:550, 
  waitForConnections:1000,  
});

// var connection;

// function handleDisconnect() {
//   connection = mysql.createConnection(mysqlConnection); // Recreate the connection, since
//   // the old one cannot be reused.

//   connection.connect(function (err) {              // The server is either down
//     if (err) {                                     // or restarting (takes a while sometimes).
//       console.log('error when connecting to db:', err);
//       setTimeout(handleDisconnect, 1000);         // We introduce a delay before attempting to reconnect,
//     }                                             // to avoid a hot loop, and to allow our node script to
//     else {                                        // process asynchronous requests in the meantime.
//       console.log("connection is successfull");
//     }
//   });
//   // If you're also serving http, display a 503 error.
//   connection.on('error', function (err) {
//     console.log('db error', err);
//     if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
//       handleDisconnect();                         // lost due to either server restart, or a
//     } else {                                      // connnection idle timeout (the wait_timeout
//       throw err;                                  // server variable configures this)
//     }
//   });
// }

mysqlConnection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('Connected DataBase!: ', results[0].solution);
});

// mysqlConnection.connect(function (err) {
//   if (err) throw err;
//   console.log("Connected DataBase!");
// });

module.exports = mysqlConnection;