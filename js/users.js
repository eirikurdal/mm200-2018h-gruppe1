const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require('./dbconnect').db; //database
const bcrypt = require('bcryptjs');


// FRA TIMEN OM DB ----------------

router.post("/login/", async function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let query = `SELECT * FROM public."users" WHERE email = '${email}'`;
    console.log(query);
    try {
        let datarows = await db.any(query);
        console.log(datarows);
        let mailMatch = datarows.length == 1 ? true : false;
        if (mailMatch == true) {
            let passwordMatch = bcrypt.compareSync(password, datarows[0].hashpassword);
            if (passwordMatch) {
                res.status(200).json({
                    msg: "Hello, " + datarows[0].username,
                    username: datarows[0].username
                });
            } else {
                res.status(401).json({
                    msg: "Feil brukernavn eller passord"
                });
            }
        } else {
            res.status(401).json({
                msg: "Feil brukernavn eller passord"
            });

        }
    } catch (err) {
        res.status(500).json({
            error: err
        }); //something went wrong!
    }


});

router.post("/register/", async function (req, res) {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    console.log(req.body);

    let userExists = checkIfUserExists(email);
    
    if(userExists == false) {
        let hashPassword = bcrypt.hashSync(password, 10);
        console.log(hashPassword);

        let query = `INSERT INTO "public"."users"("username", "email", "hashpassword") VALUES('${username}', '${email}', '${hashPassword}') RETURNING "id", "username", "email", "hashpassword", "role"`;

        try {
            let statusCode = await db.any(query) ? 200 : 500;
            console.log("Status: " + statusCode);
            res.status(statusCode).json({}).end()

        } catch (error) {
            res.status(500).json({
                error: error
            }); //something went wrong!
            console.log("ERROR: " + error);
        }
    } else {
        res.status(409).json({
                msg: "En bruker er allerede registrert på denne mailadressen"
            });
    }

});

async function checkIfUserExists(email) {
    let query = `SELECT * FROM public."users" WHERE email = '${email}'`;
    let datarows = await db.any(query);
    if (datarows.length > 0) {
        console.log("Bruker finnes allerede");
        return true;
    } else {
        console.log("Bruker finnes ikke fra før. Registrering fortsetter");
        return false;
    }
}

module.exports = router;
