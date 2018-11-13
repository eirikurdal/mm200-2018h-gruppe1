const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require('./dbconnect').db; //database
const bcrypt = require('bcryptjs');

// SECRET -----------------------------
const secret = "Lyngdal";

// AUTHENTICATE USER ------------------
router.authenticateUser = function (req) {
    let userId = req.get("userId");
    let clientToken = req.get("Auth");
    let tokenOK = bcrypt.compareSync(userId + secret, clientToken);
    if (tokenOK == true) {
        console.log("Token er ok!");
        return;
    } else {
        console.log("Token er ikke ok!");
        throw ('User not authenticated');
    }

}

// EXPORTS ----------------------------
module.exports = router;
