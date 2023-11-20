const mysqlConnection = require("../Database/index");


const getPlayList = async (req, res, next) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const query = 'SELECT  Field_name,Display_name,Sequence, Display_size, Wrapping from table_field_details  order by Sequence;';

    const sendUpdates = () => {
        mysqlConnection.query(query, (err, results) => {
            if (err) {
                res.end()
            } else {
                const data = `data: ${JSON.stringify(results)}\n\n`;
                res.write(data);
            }
        })
    }

    // const InternalId = setInterval(sendUpdates, 1000);
    sendUpdates();

    req.on('close', () => {
        // clearInterval(InternalId);
        res.end();
    });

}






module.exports = { getPlayList }; 