const express = require("express");

const router = express.Router(); 

const {  getPlayList } = require("../Controller/PlayList"); 

router.route("/").get(getPlayList); 


module.exports = router; 