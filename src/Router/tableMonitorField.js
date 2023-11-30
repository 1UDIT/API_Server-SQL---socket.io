const express = require("express");

const router = express.Router(); 

const {  getMonitorHeader } = require("../Controller/MonitoringHeader.js"); 

router.route("/").get(getMonitorHeader); 


module.exports = router; 