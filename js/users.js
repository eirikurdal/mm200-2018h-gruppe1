const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require('./dbconnect').db; //database
const bcrypt = require('bcryptjs');

const secret = "Lyngdal";


// ---------------------------

router.post("/login/", async function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let query = `SELECT * FROM public."users" WHERE email = '${email}' AND "activated"='true'`;

    try {
        let datarows = await db.any(query);
        let mailMatch = datarows.length == 1 ? true : false;
        if (mailMatch == true) {
            let passwordMatch = bcrypt.compareSync(password, datarows[0].hashpassword);
            if (passwordMatch) {
                let token = bcrypt.hashSync(datarows[0].id + secret, 10);

                res.status(200).json({
                    msg: "Hello, " + datarows[0].username,
                    username: datarows[0].username,
                    id: datarows[0].id,
                    token: token
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

    let userExists = await checkIfUserExists(email);

    if (userExists === false) {
        let hashPassword = bcrypt.hashSync(password, 10);

        let query = `INSERT INTO "public"."users"("username", "email", "hashpassword") VALUES('${username}', '${email}', '${hashPassword}') RETURNING "id", "username", "email", "hashpassword", "role", "activated"`;

        try {
            let statusCode = await db.any(query) ? 200 : 500;
            console.log("Status: " + statusCode);
            res.status(statusCode).json({
                msg: `Velkommen som bruker, ${username}`
            }).end()

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

router.post("/delete/", async function (req, res) {
    let userId = req.get("userId");

    try {
        await authenticateUser(req);


        let updateQuery = `UPDATE "public"."users" SET "activated"='false' WHERE "id"=${userId} AND "activated"='true' RETURNING "id", "username", "email", "hashpassword", "role", "activated";`;
        let updateRow = await db.any(updateQuery);
        if (updateRow.length > 0) {
            let checkQuery = `SELECT * FROM public."users" WHERE id = '${userId}'`;
            let datarows = await db.any(checkQuery);
            let activated = datarows[0].activated;
            if (activated == 'false') {
                res.status(200).json({
                    msg: "Deleted user " + datarows[0].username
                }).end();
            } else {
                res.status(400).json({
                    msg: "Noe gikk galt"
                });
            }
        } else {
            res.status(404).json({
                msg: "Brukeren du vil slette eksisterer ikke"
            });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        });
    }
});


router.post("/changepassword/", async function (req, res) {
    let email = req.body.email;
    let password = req.body.password;



});

async function checkMailAndPassword(email, password) {
    let query = `SELECT * FROM public."users" WHERE email = '${email}'`;

    try {
        let datarows = await db.any(query);
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
    p
}

async function checkIfUserExists(email) {
    let query = `SELECT * FROM public."users" WHERE email = '${email}' AND "activated"='true'`;
    let datarows = await db.any(query);
    if (datarows.length > 0) {
        return true;
    } else {
        console.log("Bruker finnes ikke fra før. Registrering fortsetter");
        return false;
    }
}

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
