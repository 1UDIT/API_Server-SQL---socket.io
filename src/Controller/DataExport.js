const mysqlConnection = require("../Database/index");
const properties = require('../../propertiesReader');

const MainTable = properties.get('EventList');


const Export = async (req, res, next) => {
    mysqlConnection.query(`SELECT * FROM ${MainTable} WHERE  Date(eventTime) BETWEEN '${req.query.prevDate}' AND '${req.query.startDate}'`, function (err, rows) {
        if (err) {
            res.status(400).send(err);
        } else {
            res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.status(200).send(rows);
        }
    });
}





module.exports = { Export }; 