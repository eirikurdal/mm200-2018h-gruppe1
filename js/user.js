var express = require('express');
var router = express.Router();
const user = {};


// FRA TIMEN OM DB ----------------

router.get('app/users', function (req, res, next) {
    let query = "Select * from Users";
    let users = db.select(query);
    if (users) {
        res.status(200).json(JSON.parse(users));
    } else {
        //??
    }
});

router.post('/app/user', function (req, res, next) {
    
    let userEmail = req.body.email;
    let userName = req.body.name;
    let passwordHash = req.body.pswHash;
    let userRole = req.body.role;
    
    let query = `INSERT INTO "public"."Users"("email", "username", "hash", "role") VALUES('${userEmail}', '${userName}', '${passwordHash}', ${userRole}) RETURNING "id", "email", "username", "hash", "role"`;
    
    let code = dp.insert(query) ? 200:500;

    res.status(code).json({}).end();
    
})


module.exports = router;