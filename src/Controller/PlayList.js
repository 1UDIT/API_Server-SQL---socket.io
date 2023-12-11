const mysqlConnection = require("../Database/index");
const properties = require('../../propertiesReader');
const log = require('../../Logger');

const MainTable_header = properties.get('EventLog_Header');


const getPlayList = async (req, res, next) => {
    mysqlConnection.getConnection(function (err, connection) {
        if (err) { log.error(`get MainTable_header Table SOCKET ERROR::${err}`); throw err; } // not connected!
        // Use the connection
        mysqlConnection.query(`SELECT  * from ${MainTable_header}  order by Sequence;`, function (err, rows) {
            if (err) {
                log.error(`MainTable_header Error::${err}`);
                res.status(400).send(err);
            } else {
                res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.status(200).send(rows);
                log.info(`get MainTable_header Ping data.length::${rows.length}`);
                connection.release();
            }
        });
    });
}





module.exports = { getPlayList }; 