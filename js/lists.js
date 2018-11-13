const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require('./dbconnect').db; //database
const bcrypt = require('bcryptjs');
const utilities = require("./utilities.js");

// ---------------------------

// ADD NEW LIST---------------
router.post("/add/", utilities.authenticateUser, async function (req, res) {

    try {
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
router.post("/update/", utilities.authenticateUser, async function (req, res) {

    try {
        let listElements = req.body;
        console.log(listElements);
        let listId = req.get("listId");
        console.log(listId);

        let query = `UPDATE lists SET content='${JSON.stringify({listElements:listElements})}' WHERE id=${listId};`;

        console.log(query);

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


// DELETE LIST ------------------------
router.post("/delete/", utilities.authenticateUser, async function (req, res) {
    try {        
        let listId = req.get("listId");        
        let deleteQuery = `UPDATE "public"."lists" SET "activated"='false' WHERE "id"=${listId} AND "activated"='true' RETURNING "id", "title", "activated";`;
        
        let deleteRow = await db.any(deleteQuery);
        
        console.log(deleteQuery);
        
        if (deleteRow.length > 0) {
            let checkQuery = `SELECT * FROM lists WHERE id = '${listId}'`;
            let datarows = await db.any(checkQuery);
            let activated = datarows[0].activated;
            if (activated == 'false') {
                res.status(200).json({
                    msg: "Deleted list " + datarows[0].title
                }).end();
            } else {
                res.status(400).json({
                    msg: "Noe gikk galt"
                });
            }
        } else {
            res.status(404).json({
                msg: "Listen du vil slette eksisterer ikke"
            });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        });
    }
});


// GET ALL LISTS ---------------
router.get("/getall/", utilities.authenticateUser, async function (req, res) {

    try {
        let userId = req.get("userId");
        let query = `SELECT * FROM lists WHERE owner = ${userId} AND "activated"='true' ORDER BY id DESC`;
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
router.get("/get/", utilities.authenticateUser, async function (req, res) {

    try {
        let listId = req.get("listId");
        let query = `SELECT * FROM lists WHERE id = ${listId} AND "activated"='true'`;
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
