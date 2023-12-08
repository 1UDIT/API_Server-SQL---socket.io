const mysqlConnection = require("../Database/index");
const properties = require('../../propertiesReader');

const MainTable = properties.get('EventList');


const getTab = async (req, res, next) => {
    mysqlConnection.getConnection(function (err, connection) {
        if (err) throw err; // not connected!
        // Use the connection
        mysqlConnection.query(`SELECT  TabName from tabswticher`, function (err, rows) {
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





module.exports = { getTab }; 