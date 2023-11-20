const mysqlConnection = require("../Database/index");


module.exports = {
    fetchDataFromDB: (callback) => { 
            mysqlConnection.query('SELECT * FROM log_viewer.rundown_log', function (err, results) {
                if (err) {
                    console.error('Error executing SQL query:', err);
                    callback(err, null);

                } else {
                    callback(null, results);
                }
            }); 
        // Example: Send data to the WebSocket client on SQL Server update        

    },
}; 
