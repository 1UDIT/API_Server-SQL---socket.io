const express = require("express");

const router = express.Router(); 

const {getTab } = require("../Controller/TabSwitcher.js"); 

router.route("/").get(getTab);  


module.exports = router; 