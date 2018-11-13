const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require('./dbconnect').db; //database
const bcrypt = require('bcryptjs');
const utilities = require("./utilities.js");

// ---------------------------

// ADD NEW LIST---------------
router.post("/add/", async function (req, res) {

    try {
        await utilities.authenticateUser(req);

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

// UPDATE LIST---------------
router.post("/update/", async function (req, res) {

    try {
        await utilities.authenticateUser(req);

        let listElements = req.body;
        console.log(listElements);
        let listId = req.get("listId");
        console.log(listId);
        
        let query = `UPDATE "public"."lists" SET "content"='{"listElements":${listElements}}' WHERE "id"=${listId};`;

        let datarows = await db.any(query);

        let statusCode = datarows ? 200 : 500;
        console.log("Status: " + statusCode);
        res.status(statusCode).json({
            msg: `Listen er oppdatert.`
        }).end()
    } catch (error) {
        res.status(500).json({
            error: error
        }); //something went wrong!
        console.log("ERROR: " + error);
    }
});


// GET ALL LISTS ---------------
router.get("/getall/", async function (req, res) {

    try {
        await utilities.authenticateUser(req);
        
        let userId = req.get("userId");
        let query = `SELECT * FROM lists WHERE owner = ${userId}`;
        let datarows = await db.any(query);
        
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

// GET SINGLE LISTS ---------------
router.get("/get/", async function (req, res) {

    try {
        await utilities.authenticateUser(req);
        
        let listId = req.get("listId");
        let query = `SELECT * FROM lists WHERE id = ${listId}`;
        let datarow = await db.any(query);
        
        let statusCode = datarow ? 200 : 500;
        console.log("Status: " + statusCode);
        res.status(statusCode).json(datarow).end()
    } catch (error) {
        res.status(500).json({
            error: error
        }); //something went wrong!
        console.log("ERROR: " + error);
    }
});

module.exports = router;
