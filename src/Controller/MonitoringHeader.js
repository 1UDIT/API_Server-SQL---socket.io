const mysqlConnection = require("../Database/index");
const properties = require('../../propertiesReader');

const Monitoring_header = properties.get('Monitoring_header');


const getMonitorHeader = async (req, res, next) => {
    mysqlConnection.getConnection(function (err, connection) {
        if (err) throw err; // not connected!
        // Use the connection
        mysqlConnection.query(`SELECT  * from ${Monitoring_header}  order by Sequence;`, function (err, rows) {
            if (err) {
                res.status(400).send(err);
            } else {
                res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.status(200).send(rows);
                connection.release();
            }
        });
    });
}





module.exports = { getMonitorHeader }; 