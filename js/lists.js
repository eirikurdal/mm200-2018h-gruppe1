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

        let query = `INSERT INTO lists(title, owner) VALUES('${listTitle}', '${userId}') RETURNING id, title, content, owner;`;

        let datarows = await db.any(query);
        
        let listId = datarows[0].id;
        let contributorQuery = `UPDATE lists SET contributors = array_append(contributors, ${userId}) WHERE id=${listId}`;
        let updateContributors = await db.any(contributorQuery);

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

// TOGGLE CONTRIBUTORS ------------------------
router.post("/togglecontributor/", utilities.authenticateUser, async function (req, res) {
    try {
        let listId = req.get("listId");
        let email = req.get("email");
        console.log(email);
        
        let getUserQuery = `SELECT * FROM users WHERE email='${email}' AND activated='true'`;
        let users = await db.any(getUserQuery);
        
        let userId = users[0].id;
        
        let checkContributorQuery = `SELECT * FROM lists WHERE id=${listId} AND ${userId} = ANY (contributors) AND "activated"='true' ORDER BY id DESC`;
        let userIsContributor = await db.any(checkContributorQuery);
        
        console.log("HERFRA");
        console.log(userIsContributor);
        
        let toggleContributorQuery;
        
        if (userIsContributor[0]) {
            toggleContributorQuery = `UPDATE lists SET contributors = array_remove(contributors, ${userId}) WHERE id=${listId}`;
            
        } else {
            toggleContributorQuery = `UPDATE lists SET contributors = array_append(contributors, ${userId}) WHERE id=${listId}`;
        }
        

        let toggledContributor = await db.any(toggleContributorQuery);

        if (userIsContributor[0]) {
                res.status(200).json({
                    msg: "Brukeren kan ikke lengre se denne listen."
                }).end();
            } else {
                res.status(200).json({
                    msg: "Brukeren kan nå se og endre denne listen."
                }).end();
            }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        });
    }
});

// UPDATE LIST---------------
router.post("/update/list/", utilities.authenticateUser, async function (req, res) {
    try {
        let listElements = req.body;
        let listId = req.get("listId");
        let idCount = req.get("newIdCount");

        let query = `UPDATE lists SET content='${JSON.stringify({listElements:listElements})}', idcount='${idCount}' WHERE id=${listId};`;

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

// UPDATE LISTTITLE ---------------
router.post("/update/listtitle/", utilities.authenticateUser, async function (req, res) {
    try {
        let newTitle = req.get("newTitle");
        let listId = req.get("listId");

        let query = `UPDATE lists SET title='${newTitle}' WHERE id=${listId};`;

        console.log(query);

        let datarows = await db.any(query);
        console.log(datarows);

        let statusCode = datarows ? 200 : 500;
        console.log("Status: " + statusCode);
        res.status(statusCode).json({
            msg: `Listetittelen er oppdatert.`
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

// DELETE LISTELEMENT ------------------------
router.post("/delete/element", utilities.authenticateUser, async function (req, res) {
    try {
        let listId = req.get("listId");
        let listElementId = req.get("listElementId");
        let query = `SELECT * FROM lists WHERE id = ${listId} AND "activated"='true'`;
        let datarow = await db.any(query);

        if (datarow.length > 0) {
            // Remove listelement
            let currentArray = datarow[0].content.listElements;
            let index = currentArray.findIndex(function(element){
                return element.id == listElementId;
            });
            currentArray.splice(index, 1);

            // Update array in DB
            let query = `UPDATE lists SET content='${JSON.stringify({listElements:currentArray})}' WHERE id=${listId};`;
            let datarows = await db.any(query);
            let statusCode = datarows ? 200 : 500;
            console.log("Status: " + statusCode);
            
            // Respond to client
            res.status(200).json({
                    msg: "Deleted listelement"
                }).end();

        } else {
            res.status(404).json({
                msg: "Listen du vil slette fra eksisterer ikke"
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
        
        let query = `SELECT * FROM lists WHERE ${userId} = ANY (contributors) AND "activated"='true' ORDER BY id DESC`;
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

// TOGGLE LIST PUBLIC ------------------------
router.post("/togglepublic/", utilities.authenticateUser, async function (req, res) {
    try {
        let listId = req.get("listId");
        
        let getCurrentListQuery = `SELECT * FROM lists WHERE id=${listId} AND activated='true'`;
        let currentList = await db.any(getCurrentListQuery);
        console.log(currentList);
        
        let togglePublicQuery;
        
        if (currentList[0].public == "false") {
            togglePublicQuery = `UPDATE lists SET public='true' WHERE id=${listId} AND activated='true' RETURNING id, title, public;`;
        } else {
            togglePublicQuery = `UPDATE lists SET public='false' WHERE id=${listId} AND activated='true' RETURNING id, title, public;`;
        }
        

        let toggledPublicList = await db.any(togglePublicQuery);

        console.log(togglePublicQuery);

        if (togglePublicQuery.length > 0) {
            let checkQuery = `SELECT * FROM lists WHERE id = '${listId}'`;
            let datarows = await db.any(checkQuery);
            let public = datarows[0].public;
            if (public == 'true') {
                res.status(200).json({
                    msg: "Listen er gjort offentlig."
                }).end();
            } else if (public == "false") {
                res.status(200).json({
                    msg: "Listen er gjort privat."
                }).end();
            } else {
                res.status(400).json({
                    msg: "Noe gikk galt"
                });
            }
        } else {
            res.status(404).json({
                msg: "Listen du vil offentliggjøre eksisterer ikke"
            });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        });
    }
});

// GET PUBLIC LISTS ---------------
router.get("/getpublic/", async function (req, res) {

    try {
        let query = `SELECT * FROM lists WHERE public = 'true' AND "activated"='true' ORDER BY id DESC`;
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


module.exports = router;
