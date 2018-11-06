const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require('./dbconnect').db; //database
const bcrypt = require('bcryptjs');

const secret = "Lyngdal";


// ---------------------------

// ADD NEW LIST---------------
router.post("/add/", async function (req, res) {

    try {
        await authenticateUser(req);

        let listTitle = req.body.listTitle;
        let userId = req.get("userId");

        let query = `INSERT INTO "public"."lists"("title", "owner") VALUES('${listTitle}', '${userId}') RETURNING "id", "title", "content", "owner";`;

        let datarows = await db.any(query);

        let statusCode = datarows ? 200 : 500;
        console.log("Status: " + statusCode);
        res.status(statusCode).json({
            msg: `Ny liste laget. Listenavn: ${listTitle}.`
        }).end()
    } catch (error) {
        res.status(500).json({
            error: error
        }); //something went wrong!
        console.log("ERROR: " + error);
    }
});


// ADD NEW LIST---------------
router.get("/get/", async function (req, res) {

    try {
        await authenticateUser(req);

        let userId = req.get("userId");
        let query = `SELECT * FROM lists WHERE owner = ${userId}`;
        let datarows = await db.any(query);
        
        console.log(datarows);

        let statusCode = datarows ? 200 : 500;
        console.log("Status: " + statusCode);
        res.status(statusCode).json({
            lists: datarows
        }).end()
    } catch (error) {
        res.status(500).json({
            error: error
        }); //something went wrong!
        console.log("ERROR: " + error);
    }
});


// AUTHENTICATE USER ------------------
function authenticateUser(req) {
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

module.exports = router;
