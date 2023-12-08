const express = require("express");

const router = express.Router(); 

const {getMonitorHeaderid } = require("../Controller/MonitoringHeader.js"); 

router.route("/").get(getMonitorHeaderid);  


module.exports = router; 