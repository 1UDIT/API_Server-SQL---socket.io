const express = require('express');
var cors = require('cors');
require('dotenv').config();
require("./src/Database/index");

const mysqlConnection = require("./src/Database/index");
const properties = require('./propertiesReader');
const log = require('./Logger.js');
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    },
    extraHeaders: {
        Cookie: 'sticky_cookie=123123123',
    },
    pingInterval: 20000,
    pingTimeout: 25000
});
const tableField = require("./src/Router/MainTableHeader.js");
const tableMonitorField = require("./src/Router/tableMonitorField.js");
const TabSwitcher = require("./src/Router/TabSwitcher.js");
const DataExport = require("./src/Router/DataExport");
const mysql = require('mysql');
const MySQLEvents = require('@rodrigogs/mysql-events');
const moment = require('moment/moment');
let data = Array(0);
let Monitoringdata = Array(0);
let currentData = Array(0);
let Pagebtn, pagecount;
let tabName;




app.use(cors());

app.use("/api/GetTableHeader", tableField);
app.use("/api/ExportData", DataExport);
app.use("/api/MontiorTableHeader", tableMonitorField);
app.use("/api/TabSwitcher", TabSwitcher);

const MainTable = properties.get('EventList');

io.sockets.on('connection', async (socket) => {

    socket.on('data-update', (Date, page) => {
        mysqlConnection.getConnection(function (err, connection) {
            if (err) { log.error(`event_log Table SOCKET ERROR::${err}`); throw err; } // not connected!
            // Use the connection
            mysqlConnection.query(`SELECT * FROM ${MainTable} WHERE Date(eventTime) BETWEEN '${Date}' AND '${moment().format("YYYY-MM-DD")}' ORDER BY eventTime DESC`, function (err, results) {
                if (err) {
                    console.error('Error executing SQL query:', err);
                    log.error(`event_log Table SOCKET ERROR::${err}`);
                } else {
                    data = results;
                    // console.log("data", results.length);
                    const pageCount = Math.ceil(results.length / 21);
                    pagecount = pageCount;
                    Pagebtn = page;
                    if (!page) { page = 1; Pagebtn = 1; }
                    if (page > pageCount) {
                        page = pageCount
                        Pagebtn = page;
                    }
                    // io.sockets.emit('data-update', [...results.slice(page * 10 - 10, page * 10)]);
                    io.sockets.emit('data-update', {
                        "page": page,
                        "pageCount": pageCount,
                        "Api": data.slice(page * 21 - 21, page * 21)
                    });
                    connection.release();
                    log.info(`event_log Table SOCKET Ping`);
                }
            });
        });
    });

    socket.on('data', function (data) {
        tabName = data;
        mysqlConnection.getConnection(function (err, connection) {
            if (err) { log.error(`event_log Table SOCKET ERROR::${err}`); throw err; }
            // Use the connection
            mysqlConnection.query(`SELECT * FROM ${data};`, function (err, results) {
                if (err) {
                    console.error('Error executing SQL query:', err);
                    log.error(`nrinstances srcdeststatus Table SOCKET ERROR::${err}`);
                } else {
                    Monitoringdata = results;
                    io.sockets.emit('Monitor', [...Monitoringdata]);
                    log.error(`nrinstances srcdeststatus Table SOCKET Ping`);
                    connection.release();
                }
            });
        });
    });

    // mysqlConnection.getConnection(function (err, connection) {
    //     if (err) throw err; // not connected!
    //     // Use the connection 
    //     mysqlConnection.query(`SELECT * FROM ${MonitoringList};`, function (err, results) {
    //         if (err) {
    //             console.error('Error executing SQL query:', err);
    //         } else {
    //             Monitoringdata = results;
    //             io.sockets.emit('Monitor', [...Monitoringdata]);
    //             // console.log('Monitoringdata result', Monitoringdata)  
    //             connection.release();
    //         }
    //     });
    // });


    // mysqlConnection.getConnection(function (err, connection) {
    //     if (err) throw err; // not connected!
    //     // Use the connection
    //     mysqlConnection.query(`SELECT * FROM ${SrcConnectionList};`, function (err, results) {
    //         if (err) {
    //             console.error('Error executing SQL query:', err);
    //         } else {
    //             SrcConnection = results;
    //             io.sockets.emit('SrcConnection', [...SrcConnection]);
    //             // console.log('SrcConnection result', SrcConnection)
    //             connection.release();
    //         }
    //     });
    // });
});



const program = async () => {
    const connection = mysql.createPool({
        host: properties.get('host'),
        user: properties.get('user'),
        password: properties.get('password'),
        port: properties.get('port'),
        timezone: 'utc'
    });

    const instance = new MySQLEvents(connection, {
        startAtEnd: true,
        excludedSchemas: {
            mysql: true,
        },
    });

    await instance.start();

    instance.addTrigger({
        name: `${MainTable}`,
        expression: `${properties.get('database')}.*`,
        statement: MySQLEvents.STATEMENTS.ALL,
        onEvent: (e) => { // You will receive the events here 
            currentData = e.affectedRows;
            let newData;
            switch (e.type) {
                case "DELETE":
                    newData = currentData[0].before;
                    let index = data.findIndex(p => p.eventId === newData.eventId);
                    let monitorIndex = Monitoringdata.findIndex(p => p.SrcDestName === undefined ? p.sn === newData.sn : p.SrcDestName === newData.SrcDestName);
                    if (index > -1) {
                        data = data.filter(p => p.eventId !== newData.eventId);
                        io.sockets.emit('data-update', {
                            "page": Pagebtn,
                            "pageCount": pagecount,
                            "Api": [...data.slice(Pagebtn * 21 - 21, Pagebtn * 21)]
                        });
                    }
                    if (monitorIndex > -1) {
                        mysqlConnection.getConnection(function (err, connection) {
                            if (err) throw err; // not connected!
                            // Use the connection
                            mysqlConnection.query(`SELECT * FROM ${tabName}`, function (err, results) {
                                if (err) {
                                    console.error('Error executing SQL query:', err);
                                    log.error(`nrinstances srcdeststatus Table addTrigger Delete::${err}`);
                                } else {
                                    Monitoringdata = results;
                                    io.sockets.emit('Monitor', [...Monitoringdata]);
                                    log.info(`nrinstances srcdeststatus Table addTrigger Delete`);
                                    connection.release();
                                }
                            });
                        });
                    }
                    break;

                case "UPDATE":
                    newData = currentData[0].after;
                    // Find index of the deleted product in the current array, if it was there
                    let index2 = data.findIndex(p => p.eventId === newData.eventId);
                    let index3 = Monitoringdata.findIndex(p => p.SrcDestName === undefined ? p.sn === newData.sn : p.SrcDestName === newData.SrcDestName);
                    // If product is present, index will be gt -1  
                    if (index2 > -1) {
                        data[index2] = newData;
                        io.sockets.emit('data-update', {
                            "page": Pagebtn,
                            "pageCount": pagecount,
                            "Api": [...data.slice(Pagebtn * 21 - 21, Pagebtn * 21)]
                        });
                        log.info(`event_log Table addTrigger UPDATE`);
                    }
                    if (index3 > -1) {
                        Monitoringdata[index3] = newData;
                        io.sockets.emit('Monitor', [...Monitoringdata]);
                        log.info(`nrinstances srcdeststatus Table addTrigger UPDATE`);
                    }
                    break;

                case "INSERT":
                    newData = currentData[0].after
                    if (newData.eventId) {
                        mysqlConnection.getConnection(function (err, connection) {
                            if (err) throw err; // not connected!
                            // Use the connection
                            mysqlConnection.query(`SELECT * FROM ${MainTable} WHERE Date(eventTime) BETWEEN '${Date}' AND '${moment().format("YYYY-MM-DD")}' ORDER BY eventTime DESC`, function (err, results) {
                                if (err) {
                                    console.error('Error executing SQL query:', err);
                                } else {
                                    data = results;
                                    const pageCount = Math.ceil(results.length / 21);
                                    io.sockets.emit('data-update', {
                                        "page": Pagebtn,
                                        "pageCount": pageCount,
                                        "Api": data.slice(Pagebtn * 21 - 21, Pagebtn * 21)
                                    });
                                    connection.release();
                                }
                            });
                        });
                    }
                    if (newData.sn || newData.SrcDestName) {
                        mysqlConnection.getConnection(function (err, connection) {
                            if (err) throw err; // not connected!
                            // Use the connection
                            mysqlConnection.query(`SELECT * FROM ${tabName}`, function (err, results) {
                                if (err) {
                                    console.error('Error executing SQL query:', err);
                                } else {
                                    Monitoringdata = results;
                                    io.sockets.emit('Monitor', [...Monitoringdata]);
                                    connection.release();
                                }
                            });
                        });
                    }

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

