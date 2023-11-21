const mysqlConnection = require("../Database/index");


const Export = async (req, res, next) => {
    console.log(req.query);
    mysqlConnection.query(`SELECT * FROM log_viewer.rundown_log WHERE CONVERT(date, Date) BETWEEN '${req.query.prevDate}' AND '${req.query.startDate}'`, function (err, rows) {
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(200).send(rows);
        }
    });
}





module.exports = { Export }; 