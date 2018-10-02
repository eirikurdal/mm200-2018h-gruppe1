const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = (process.env.PORT || 8080);

app.set('port', port);
app.use(express.static('public'));
app.use(bodyParser.json());

//------------------------------

const users = [];

app.post('/api/user', function (req, res, next) {

    //let userName = req.body.userName;
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


/*
user.id = users.length +1;
    users.push(user);
    
    res.json(user).end();
*/

//----------------------------------

app.listen(app.get('port'), function () {
    console.log('server running', app.get('port'));
})
