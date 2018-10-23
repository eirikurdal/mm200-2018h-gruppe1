const express = require('express');
const bodyParser = require('body-parser');
//const db = require("./js/db.js");
//const user = require("./js/user.js");

const app = express();
const port = (process.env.PORT || 8080);

app.set('port', port);
app.use(express.static('public'));
app.use(bodyParser.json());
//app.use(user);

//------------------------------

const users = [];

let loginUserId;

app.post('/api/user', function (req, res, next) {

    let userMail = req.body.userMail;

    let isUnique = !isMailInList(users, userMail);

    if (isUnique && userMail) {
        req.body.id = users.length + 1;
        users.push(req.body);
        res.status(200).json(users).end();
    } else {
        res.status(400).json(users).end();
    }
});

app.post('/api/login', function (req, res, next) {

    let loginUserMail = req.body.loginUserMail;
    let loginUserPassword = req.body.loginUserPassword;

    let userExists = isUserInList(users, loginUserMail, loginUserPassword);

    if (userExists && loginUserMail && loginUserPassword) {
        res.status(200).json({
            userName: users[loginUserId - 1].userName
        }).end();
    } else {
        res.status(404).end();
    }
});

// users[loginUserId-1].userName

function isMailInList(list, mail) {
    let searchMail = mail.toString().toLowerCase();
    let result = false;
    for (let user in list) {
        if (list[user].userMail.toLowerCase() === searchMail) {
            result = true;
            break;
        }
    }
    return result;
}

function isUserInList(list, mail, password) {
    let searchMail = mail.toString().toLowerCase();
    let searchPassword = password.toString().toLowerCase();
    let result = false;
    for (let user in list) {
        if (list[user].userMail.toLowerCase() === searchMail) {
            if (list[user].userPassword.toLowerCase() === searchPassword) {
                loginUserId = list[user].id;
                result = true;
                break;
            }
        }
    }
    return result;
}


//----------------------------------

app.listen(app.get('port'), function () {
    console.log('server running', app.get('port'));
})
