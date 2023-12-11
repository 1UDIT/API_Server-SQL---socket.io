const mysqlConnection = require("../Database/index");
const properties = require('../../propertiesReader');
const log = require('../../Logger');

const MainTable = properties.get('EventList');


const Export = async (req, res, next) => {
    mysqlConnection.getConnection(function (err, connection) {
        if (err) { log.error(`event_log Table SOCKET ERROR::${err}`); throw err; } // not connected!
        // Use the connection
        mysqlConnection.query(`SELECT * FROM ${MainTable} WHERE  Date(eventTime) BETWEEN '${req.query.prevDate}' AND '${req.query.startDate}'`, function (err, rows) {
            if (err) {
                log.error(`Export Error::${err}`);
                res.status(400).send(err);
            } else {
                res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.status(200).send(rows);
                log.info(`Export Ping data.length::${rows.length}`);
                connection.release();
            }
        });
    });
}





module.exports = { Export }; 