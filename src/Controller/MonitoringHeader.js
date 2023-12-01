const mysqlConnection = require("../Database/index");


const getMonitorHeader = async (req, res, next) => {
    mysqlConnection.query('SELECT  * from monitoringheader  order by Sequence;', function (err, rows) {
        if (err) {
            res.status(400).send(err);
        } else {
            res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.status(200).send(rows);
        }
    });
}





module.exports = { getMonitorHeader }; 