const express = require('express');
var cors = require('cors');
require('dotenv').config();
require("./src/Database/index");
const mysqlConnection = require("./src/Database/index");
const properties = require('./propertiesReader');
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    },     
});

const tableField = require("./src/Router/PlayList"); 
const DataExport = require("./src/Router/DataExport");
const mysql = require('mysql');
const MySQLEvents = require('@rodrigogs/mysql-events');
const moment = require('moment/moment');
let data = Array(0);
let currentData = Array(0);

app.use(cors());

app.use("/api/getPlaylist", tableField);
app.use("/api/ExportData",DataExport);


io.sockets.on('connection', async (socket) => {
    // tableField(io, socket);

    mysqlConnection.query(`SELECT * FROM log_viewer.rundown_log`, function (err, results) {
        if (err) {
            console.error('Error executing SQL query:', err);
        } else {
            data = results;
            let cols = data.map((key) => {
                var date = new Date(key.Date);
                if (!isNaN(date.getTime())) {
                    // Months use 0 index.
                    return {
                        id: key.id,
                        Date: `${date.getDate()}` + '-' + `${date.getMonth() + 1}` + '-' + `${date.getFullYear()}`,
                        Time: key.Time,
                        APP_Name: key.APP_Name,
                        Source_Dest: key.Source_Dest,
                        Event: key.Event,
                        LEVEL: key.LEVEL,
                        Event_DESCRI: key.Event_DESCRI,
                    };
                }

            });
            socket.emit('data-update', cols);
        }
    });

    await socket.on('data-update', (Date) => {
        mysqlConnection.query(`SELECT * FROM log_viewer.rundown_log WHERE CONVERT(date, Date) BETWEEN '${Date}' AND '${moment().format("YYYY-MM-DD")}' ;`, function (err, results) {
            if (err) {
                console.error('Error executing SQL query:', err);
            } else {
                data = results;
                let cols = data.map((key) => {
                    if (!isNaN(key.Date.getTime())) {
                        // Months use 0 index.
                        return {
                            id: key.id,
                            Date: `${key.Date.getDate()}` + '-' + `${key.Date.getMonth() + 1}` + '-' + `${key.Date.getFullYear()}`,
                            Time: key.Time,
                            APP_Name: key.APP_Name,
                            Source_Dest: key.Source_Dest,
                            Event: key.Event,
                            LEVEL: key.LEVEL,
                            Event_DESCRI: key.Event_DESCRI,
                        };
                    }

                });
                io.sockets.emit('data-update', [...cols]);
            }
        });
    });

    await socket.on('disconnect', () => {
        console.log('Socket.IO connection closed');
    });
});


const program = async () => {
    const connection = mysql.createConnection({
        host: properties.get('host'),
        user: properties.get('user'),
        password: properties.get('password'),
    });

    const instance = new MySQLEvents(connection, {
        startAtEnd: true,
        excludedSchemas: {
            mysql: true,
        },
    });

    await instance.start();

    instance.addTrigger({
        name: 'log_viewer',
        expression: `${properties.get('database')}.*`,
        statement: MySQLEvents.STATEMENTS.ALL,
        onEvent: (e) => { // You will receive the events here 
            currentData = e.affectedRows;
            let newData;
            switch (e.type) {
                case "DELETE":
                    // Assign current event (before) data to the newData variable
                    newData = currentData[0].before;

                    // Find index of the deleted product in the current array, if it was there
                    let index = data.findIndex(p => p.id === newData.id);

                    // If product is present, index will be gt -1
                    if (index > -1) {
                        data = data.filter(p => p.id !== newData.id);
                        io.sockets.emit('data-update', [...data]);
                    } else {
                        return;
                    }
                    break;

                case "UPDATE":
                    newData = currentData[0].after;
                    // Find index of the deleted product in the current array, if it was there
                    let index2 = data.findIndex(p => p.id === newData.id);
                    // If product is present, index will be gt -1
                    if (index2 > -1) {
                        data[index2] = newData;
                        io.sockets.emit('data-update', [...data]);
                    } else {
                        return;
                    }
                    break;

                case "INSERT":

                    mysqlConnection.query('SELECT * FROM log_viewer.rundown_log', function (err, results) {
                        if (err) {
                            console.error('Error executing SQL query:', err);
                            callback(err, null);

                        } else {
                            data = results;
                            console.log(data, "data");
                            io.sockets.emit('data-update', [...data]);
                        }
                    });
                    break;
                default:
                    break;
            }

        },
    });

    instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

program()
    .then(() => console.log('Waiting for database events...'))
    .catch(console.error);

const port = properties.get('PORT') || 8888;
server.listen(port, () => {
    console.log(`Connection Started ${port}`);
})

