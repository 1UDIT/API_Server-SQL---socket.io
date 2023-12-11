
var log4js = require("log4js");

log4js.configure({
    appenders: { log: { type: "file", filename: "./Log/SqlLog.log", maxLogSize: 10485760, backups: 3, compress: true } },
    categories: { default: { appenders: ["log"], level: ["debug"] } },
});
const logger = log4js.getLogger('::');

module.exports = logger