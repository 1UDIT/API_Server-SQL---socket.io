const express = require("express");

const router = express.Router(); 

const {  Export } = require("../Controller/DataExport"); 

router.route("/").get(Export); 


module.exports = router; 